import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { taskService } from "../../../api/taskService";
import { doc, getCountFromServer, getDoc, onSnapshot, orderBy, Timestamp, writeBatch } from "firebase/firestore";
import { batchOps } from "../../../api/batchOpsHelper";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getCountFromServer: jest.fn(),
    getDoc: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn((ref) => ref),
    Timestamp: { now: jest.fn() },
    writeBatch: jest.fn(),
}));

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn().mockResolvedValue(undefined),
    OPERATION_TYPES: { DELETE: "DELETE", UPDATE: "UPDATE", SET: "SET" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        columnTasks: jest.fn(),
        userTasks: jest.fn(),
        columnTask: jest.fn(),
        userTask: jest.fn(),
        project: jest.fn(),
        projectColumn: jest.fn(),
    },
}));

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

function makeDoc(id, data) {
    return {
        id,
        data: () => data,
    };
}

describe("taskService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Timestamp.now.mockReturnValue("mocked-now");
    });

    describe("subscribeToColumnTasks", () => {
        it("calls onUpdate with mapped tasks and returns unsubscribe", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({ docs: [makeDoc("t1", { name: "A" }), makeDoc("t2", { name: "B" })] });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = taskService.subscribeToColumnTasks("p1", "c1", onUpdate);

            expect(pathHelper.columnTasks).toHaveBeenCalledWith("p1", "c1");
            expect(orderBy).toHaveBeenCalledWith("order", "asc");
            expect(onUpdate).toHaveBeenCalledWith([
                { id: "t1", name: "A" },
                { id: "t2", name: "B" },
            ]);
            expect(result).toBe(unsub);
        });
    });

    describe("subscribeToUserTasks", () => {
        it("sorts tasks by projectName and label", () => {
            onSnapshot.mockImplementation((_ref, cb) => {
                cb({
                    docs: [
                        makeDoc("t1", { projectName: "B", label: "b" }),
                        makeDoc("t2", { projectName: "A", label: "z" }),
                        makeDoc("t3", { projectName: "A", label: "a" }),
                    ],
                });
                return jest.fn();
            });

            const onUpdate = jest.fn();
            taskService.subscribeToUserTasks("u1", onUpdate);

            expect(pathHelper.userTasks).toHaveBeenCalledWith("u1");
            expect(onUpdate).toHaveBeenCalledWith([
                { id: "t3", projectName: "A", label: "a" },
                { id: "t2", projectName: "A", label: "z" },
                { id: "t1", projectName: "B", label: "b" },
            ]);
        });
    });

    describe("createTask", () => {
        it("throws when projectId is missing", async () => {
            await expect(
                taskService.createTask("", "Project", "c1", "Todo", { name: "Task" })
            ).rejects.toThrow("Project ID is required to create a task");
        });

        it("creates column and user tasks with normalized data and order", async () => {
            const batch = { set: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) };
            writeBatch.mockReturnValue(batch);
            getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 2 }) });

            pathHelper.columnTasks.mockReturnValue("columnTasksRef");
            pathHelper.userTasks.mockImplementation((id) => `userTasks/${id}`);
            doc.mockImplementation((...args) => ({
                id: args[1] || "generated-id",
                _path: args,
            }));

            await taskService.createTask("p1", "Project", "c1", "Todo", {
                name: "  Task  ",
                description: "  Desc  ",
                label: "  L1  ",
                assignedMembers: [{ id: "u1" }, { id: "u2" }],
            });

            expect(batch.set).toHaveBeenCalledTimes(3);
            const columnCall = batch.set.mock.calls.find(([, data]) => data.order !== undefined);
            expect(columnCall[1]).toMatchObject({
                name: "Task",
                description: "Desc",
                label: "L1",
                assignedMembers: [{ id: "u1" }, { id: "u2" }],
                order: 2,
                createdAt: "mocked-now",
            });

            const userCalls = batch.set.mock.calls.filter(([, data]) => data.projectId);
            expect(userCalls).toHaveLength(2);
            expect(userCalls[0][1]).toMatchObject({
                projectId: "p1",
                projectName: "Project",
                columnId: "c1",
                columnName: "Todo",
                createdAt: "mocked-now",
            });

            const userDocCalls = doc.mock.calls.filter((args) => args.length === 2);
            userDocCalls.forEach((args) => expect(args[1]).toBe("generated-id"));
            expect(batch.commit).toHaveBeenCalled();
        });
    });

    describe("getTaskRefsToDelete", () => {
        it("returns delete operations for column and assigned members", () => {
            pathHelper.columnTask.mockReturnValue("columnTaskRef");
            pathHelper.userTask.mockImplementation((id) => `userTask/${id}`);

            const ops = taskService.getTaskRefsToDelete("p1", "c1", "t1", [
                { id: "u1" },
                { id: "u2" },
            ]);

            expect(ops).toEqual([
                { type: "DELETE", ref: "columnTaskRef" },
                { type: "DELETE", ref: "userTask/u1" },
                { type: "DELETE", ref: "userTask/u2" },
            ]);
        });
    });

    describe("deleteTask", () => {
        it("calls batchOps with delete operations", async () => {
            pathHelper.columnTask.mockReturnValue("columnTaskRef");
            pathHelper.userTask.mockImplementation((id, taskId) => `userTask/${id}/${taskId}`);

            await taskService.deleteTask("p1", "c1", "t1", [{ id: "u1" }]);

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    { type: "DELETE", ref: "columnTaskRef" },
                    { type: "DELETE", ref: "userTask/u1/t1" },
                ])
            );
        });
    });

    describe("reorderColumnTasks", () => {
        it("updates only the affected range", async () => {
            const tasks = [{ id: "t0" }, { id: "t1" }, { id: "t2" }, { id: "t3" }];
            pathHelper.columnTask.mockImplementation((_p, _c, taskId) => `task/${taskId}`);

            await taskService.reorderColumnTasks("p1", "c1", tasks, 1, 3);

            const ops = batchOps.mock.calls[0][1];
            expect(ops).toHaveLength(3);
            expect(ops.map((op) => op.data.order)).toEqual([1, 2, 3]);
        });
    });

    describe("moveTaskToColumn", () => {
        it("moves task and updates user task copies", async () => {
            getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 5 }) });
            pathHelper.columnTask.mockImplementation((_p, colId, taskId) => `column/${colId}/${taskId}`);
            pathHelper.userTask.mockImplementation((memberId, taskId) => `user/${memberId}/${taskId}`);

            const task = {
                id: "t1",
                name: "Task",
                description: "Desc",
                label: "L",
                createdAt: "created",
                hints: "hint",
                assignedMembers: [{ id: "u1" }, { id: "u2" }],
            };

            await taskService.moveTaskToColumn("p1", task, "c1", { id: "c2", name: "Done" });

            const ops = batchOps.mock.calls[0][1];
            expect(ops).toEqual(expect.arrayContaining([
                { type: "DELETE", ref: "column/c1/t1" },
                {
                    type: "SET",
                    ref: "column/c2/t1",
                    data: expect.objectContaining({ order: 5, hints: "hint" }),
                },
                {
                    type: "UPDATE",
                    ref: "user/u1/t1",
                    data: { columnId: "c2", columnName: "Done" },
                },
            ]));
        });
    });

    describe("updateTask", () => {
        it("throws when task does not exist", async () => {
            pathHelper.columnTask.mockReturnValue("taskRef");
            getDoc.mockResolvedValueOnce({ exists: () => false });

            await expect(
                taskService.updateTask("p1", "c1", "t1", { name: "New" })
            ).rejects.toThrow("Task not found");
        });

        it("handles added and kept members", async () => {
            pathHelper.columnTask.mockReturnValue("taskRef");
            pathHelper.userTask.mockImplementation((id, taskId) => `userTask/${id}/${taskId}`);
            pathHelper.project.mockReturnValue("projectRef");
            pathHelper.projectColumn.mockReturnValue("columnRef");

            getDoc
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({
                        assignedMembers: [{ id: "u1" }],
                        createdAt: "created",
                    }),
                })
                .mockResolvedValueOnce({ data: () => ({ title: "Project X" }) })
                .mockResolvedValueOnce({ data: () => ({ name: "Todo" }) });

            await taskService.updateTask("p1", "c1", "t1", {
                name: "New",
                description: "Desc",
                label: "L1",
                assignedMembers: [{ id: "u1" }, { id: "u2" }],
            });

            const ops = batchOps.mock.calls[0][1];
            const setOp = ops.find((op) => op.type === "SET");
            const keptOp = ops.find((op) => op.type === "UPDATE" && op.ref === "userTask/u1/t1");

            expect(setOp).toMatchObject({
                ref: "userTask/u2/t1",
                data: expect.objectContaining({
                    projectId: "p1",
                    projectName: "Project X",
                    columnId: "c1",
                    columnName: "Todo",
                    createdAt: "created",
                }),
            });
            expect(keptOp).toBeDefined();
        });

        it("handles removed members without extra reads", async () => {
            pathHelper.columnTask.mockReturnValue("taskRef");
            pathHelper.userTask.mockImplementation((id, taskId) => `userTask/${id}/${taskId}`);
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    assignedMembers: [{ id: "u1" }],
                    createdAt: "created",
                }),
            });

            await taskService.updateTask("p1", "c1", "t1", {
                name: "New",
                assignedMembers: [],
            });

            const ops = batchOps.mock.calls[0][1];
            expect(getDoc).toHaveBeenCalledTimes(1);
            expect(ops).toEqual(expect.arrayContaining([
                { type: "DELETE", ref: "userTask/u1/t1" },
            ]));
        });
    });
});
