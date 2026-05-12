import { jest, describe, it, expect, afterEach } from "@jest/globals";
import { taskService } from "../../../api/taskService";
import { onSnapshot, writeBatch } from "firebase/firestore";
import { pathHelper } from "../../../api/pathHelper";
import { batchOps } from "../../../api/batchOpsHelper";

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(() => ({ id: "mockTaskId" })),
    onSnapshot: jest.fn(),
    writeBatch: jest.fn(),
    Timestamp: { now: jest.fn(() => "mockTimestamp") },
}));

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn(),
    OPERATION_TYPES: { DELETE: "DELETE", UPDATE: "UPDATE" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        columnTasks: jest.fn(),
        columnTask: jest.fn(),
        userTasks: jest.fn(),
        userTask: jest.fn(),
    },
}));

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

// helpers 

const TASK_DATA = {
    name: "Test Task",
    description: "Desc",
    label: "urgent",
    assignedMembers: [{ id: "u1", email: "u1@test.com" }],
};

// createTask full signature: (projectId, projectName, columnId, columnName, taskData)
const createTask = (taskData = TASK_DATA) =>
    taskService.createTask("p1", "Project A", "c1", "Column A", taskData);

// tests 

describe("taskService", () => {
    let mockBatch;

    beforeEach(() => {
        mockBatch = { set: jest.fn(), commit: jest.fn() };
        writeBatch.mockReturnValue(mockBatch);
        pathHelper.columnTasks.mockReturnValue("columnTasksRef");
        pathHelper.userTasks.mockReturnValue("userTasksRef");
        pathHelper.columnTask.mockReturnValue("columnTaskRef");
        pathHelper.userTask.mockReturnValue("userTaskRef");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // subscribeToColumnTasks

    describe("subscribeToColumnTasks", () => {
        it("should call onUpdate with mapped docs", () => {
            const mockOnUpdate = jest.fn();
            onSnapshot.mockImplementation((ref, cb) => {
                cb({ docs: [{ id: "t1", data: () => ({ name: "Task 1" }) }] });
                return jest.fn();
            });

            taskService.subscribeToColumnTasks("p1", "c1", mockOnUpdate);

            expect(pathHelper.columnTasks).toHaveBeenCalledWith("p1", "c1");
            expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "t1", name: "Task 1" }]);
        });

        it("should call onUpdate with an empty array when there are no tasks", () => {
            const mockOnUpdate = jest.fn();
            onSnapshot.mockImplementation((ref, cb) => {
                cb({ docs: [] });
                return jest.fn();
            });

            taskService.subscribeToColumnTasks("p1", "c1", mockOnUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith([]);
        });

        it("should return the unsubscribe function", () => {
            const unsub = jest.fn();
            onSnapshot.mockReturnValue(unsub);

            const result = taskService.subscribeToColumnTasks("p1", "c1", jest.fn());

            expect(result).toBe(unsub);
        });
    });

    // subscribeToUserTasks
    // was completely untested

    describe("subscribeToUserTasks", () => {
        it("should call onUpdate with tasks sorted by projectName then label", () => {
            const mockOnUpdate = jest.fn();
            onSnapshot.mockImplementation((ref, cb) => {
                cb({
                    docs: [
                        { id: "t1", data: () => ({ projectName: "B", label: "low" }) },
                        { id: "t2", data: () => ({ projectName: "A", label: "urgent" }) },
                        { id: "t3", data: () => ({ projectName: "A", label: "low" }) },
                    ]
                });
                return jest.fn();
            });

            taskService.subscribeToUserTasks("u1", mockOnUpdate);

            expect(pathHelper.userTasks).toHaveBeenCalledWith("u1");
            expect(mockOnUpdate).toHaveBeenCalledWith([
                { id: "t3", projectName: "A", label: "low" },    // A < B, low < urgent
                { id: "t2", projectName: "A", label: "urgent" },
                { id: "t1", projectName: "B", label: "low" },
            ]);
        });

        it("should sort by label when projectName is the same", () => {
            const mockOnUpdate = jest.fn();
            onSnapshot.mockImplementation((ref, cb) => {
                cb({
                    docs: [
                        { id: "t1", data: () => ({ projectName: "A", label: "urgent" }) },
                        { id: "t2", data: () => ({ projectName: "A", label: "low" }) },
                    ]
                });
                return jest.fn();
            });

            taskService.subscribeToUserTasks("u1", mockOnUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith([
                { id: "t2", projectName: "A", label: "low" },
                { id: "t1", projectName: "A", label: "urgent" },
            ]);
        });

        it("should call onUpdate with empty array when there are no tasks", () => {
            const mockOnUpdate = jest.fn();
            onSnapshot.mockImplementation((ref, cb) => {
                cb({ docs: [] });
                return jest.fn();
            });

            taskService.subscribeToUserTasks("u1", mockOnUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith([]);
        });
    });

    // createTask

    describe("createTask", () => {
        it("should throw if projectId is missing", async () => {
            await expect(
                taskService.createTask(null, "Project A", "c1", "Column A", TASK_DATA)
            ).rejects.toThrow("Project ID is required to create a task");
        });

        it("should commit the batch", async () => {
            await createTask();
            expect(mockBatch.commit).toHaveBeenCalled();
        });

        it("should set the column task with normalized data and timestamp", async () => {
            await createTask();

            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    name: "Test Task",
                    description: "Desc",
                    label: "urgent",
                    createdAt: "mockTimestamp",
                })
            );
        });

        it("should trim whitespace from name, description and label", async () => {
            await createTask({ name: "  Task  ", description: "  Desc  ", label: "  urgent  ", assignedMembers: [] });

            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ name: "Task", description: "Desc", label: "urgent" })
            );
        });

        it("should normalize null/undefined fields to empty strings and []", async () => {
            await createTask({ name: undefined, description: null, label: undefined, assignedMembers: undefined });

            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ name: "", description: "", label: "", assignedMembers: [] })
            );
        });

        it("should set a userTask for each assigned member with project and column metadata", async () => {
            await createTask({
                ...TASK_DATA,
                assignedMembers: [{ id: "u1" }, { id: "u2" }],
            });

            // 2 userTask sets + 1 columnTask set = 3 total
            expect(mockBatch.set).toHaveBeenCalledTimes(3);
            expect(pathHelper.userTasks).toHaveBeenCalledWith("u1");
            expect(pathHelper.userTasks).toHaveBeenCalledWith("u2");

            // userTask docs include project and column context
            expect(mockBatch.set).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    projectId: "p1",
                    projectName: "Project A",
                    columnId: "c1",
                    columnName: "Column A",
                })
            );
        });

        it("should not set any userTask when assignedMembers is empty", async () => {
            // ← tests assignedMembersIds || [] fallback → loop never runs
            await createTask({ name: "Task", assignedMembers: undefined });

            // only the columnTask set
            expect(mockBatch.set).toHaveBeenCalledTimes(1);
            expect(pathHelper.userTasks).not.toHaveBeenCalled();
        });
    });

    // getTaskRefsToDelete
    // was completely untested

    describe("getTaskRefsToDelete", () => {
        it("should always include the columnTask ref", () => {
            const ops = taskService.getTaskRefsToDelete("p1", "c1", "t1", []);

            expect(pathHelper.columnTask).toHaveBeenCalledWith("p1", "c1", "t1");
            expect(ops).toContainEqual({ type: "DELETE", ref: "columnTaskRef" });
        });

        it("should include a userTask ref for each assigned member", () => {
            const ops = taskService.getTaskRefsToDelete("p1", "c1", "t1", [
                { id: "u1" },
                { id: "u2" },
            ]);

            expect(pathHelper.userTask).toHaveBeenCalledWith("u1", "t1");
            expect(pathHelper.userTask).toHaveBeenCalledWith("u2", "t1");
            expect(ops).toHaveLength(3); // 1 columnTask + 2 userTasks
        });

        it("should skip userTask refs when assignedMembers is empty", () => {
            // ← tests the if (assignedMembers.length > 0) guard
            const ops = taskService.getTaskRefsToDelete("p1", "c1", "t1", []);

            expect(pathHelper.userTask).not.toHaveBeenCalled();
            expect(ops).toHaveLength(1); // only columnTask
        });
    });

    // deleteTask 

    describe("deleteTask", () => {
        it("should call batchOps with the columnTask ref when no members are assigned", async () => {
            // ← was using deleteDoc — source uses batchOps
            await taskService.deleteTask("p1", "c1", "t1", []);

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                [{ type: "DELETE", ref: "columnTaskRef" }]
            );
        });

        it("should call batchOps with columnTask and all userTask refs", async () => {
            await taskService.deleteTask("p1", "c1", "t1", [{ id: "u1" }, { id: "u2" }]);

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    { type: "DELETE", ref: "columnTaskRef" },
                    { type: "DELETE", ref: "userTaskRef" },
                ])
            );
            // columnTask + 2 userTasks
            const [, ops] = batchOps.mock.calls[0];
            expect(ops).toHaveLength(3);
        });

        it("should propagate batchOps errors", async () => {
            batchOps.mockRejectedValue(new Error("Firestore error"));

            await expect(
                taskService.deleteTask("p1", "c1", "t1", [])
            ).rejects.toThrow("Firestore error");
        });
    });
});