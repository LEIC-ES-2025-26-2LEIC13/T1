import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { templateColumnService } from "../../../api/templateColumnService";
import { doc, getCountFromServer, getDoc, getDocs, onSnapshot, orderBy, updateDoc, runTransaction } from "firebase/firestore";
import { batchOps } from "../../../api/batchOpsHelper";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("firebase/firestore", () => ({
    deleteField: jest.fn(() => "delete-field"),
    doc: jest.fn(),
    getCountFromServer: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn((ref) => ref),
    runTransaction: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn().mockResolvedValue(undefined),
    OPERATION_TYPES: { DELETE: "DELETE", UPDATE: "UPDATE", SET: "SET" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        template: jest.fn(),
        templateColumns: jest.fn(),
        templateColumn: jest.fn(),
        templateColumnTasks: jest.fn(),
        templateColumnTask: jest.fn(),
    },
}));

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

function makeDoc(id, data, ref = { id }) {
    return { id, ref, data: () => data };
}

describe("templateColumnService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("subscribeToTemplateColumns", () => {
        it("maps columns and orders by order asc", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({ docs: [makeDoc("c1", { name: "A" }), makeDoc("c2", { name: "B" })] });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = templateColumnService.subscribeToTemplateColumns("t1", onUpdate);

            expect(pathHelper.templateColumns).toHaveBeenCalledWith("t1");
            expect(orderBy).toHaveBeenCalledWith("order", "asc");
            expect(onUpdate).toHaveBeenCalledWith([
                { id: "c1", name: "A" },
                { id: "c2", name: "B" },
            ]);
            expect(result).toBe(unsub);
        });
    });

    describe("createColumn", () => {
        it("throws when templateId is missing", async () => {
            await expect(
                templateColumnService.createColumn("", { name: "Col" })
            ).rejects.toThrow("Template ID is required to create a column");
        });

        it("increments columnCount and trims name", async () => {
            const templateRef = { id: "t1" };
            pathHelper.template.mockReturnValue(templateRef);
            doc.mockReturnValue("newColumnRef");
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get: jest.fn().mockResolvedValue({ data: () => ({ columnCount: 2 }) }),
                    update: jest.fn(),
                    set: jest.fn(),
                };
                await cb(txn);
                expect(txn.update).toHaveBeenCalledWith(templateRef, { columnCount: 3 });
                expect(txn.set).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.objectContaining({ name: "Trim", order: 3 })
                );
            });

            await templateColumnService.createColumn("t1", { name: "  Trim  " });
        });
    });

    describe("deleteColumn", () => {
        it("deletes tasks and the column", async () => {
            const taskRef = { id: "task1" };
            getDocs.mockResolvedValueOnce({
                forEach: (cb) => cb({ ref: taskRef }),
            });
            pathHelper.templateColumn.mockReturnValue("columnRef");

            await templateColumnService.deleteColumn("t1", "c1");

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    { type: "DELETE", ref: taskRef },
                    { type: "DELETE", ref: "columnRef" },
                ])
            );
        });
    });

    describe("updateColumn", () => {
        it("throws when name is empty", async () => {
            await expect(
                templateColumnService.updateColumn("t1", "c1", { name: " " })
            ).rejects.toThrow("Column name cannot be empty");
        });

        it("returns early when no name is provided", async () => {
            await templateColumnService.updateColumn("t1", "c1", {});
            expect(batchOps).not.toHaveBeenCalled();
        });
    });

    describe("subscribeToColumnTasks", () => {
        it("maps tasks by id", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({ docs: [makeDoc("t1", { name: "Task" })] });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = templateColumnService.subscribeToColumnTasks("t1", "c1", onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([{ id: "t1", name: "Task" }]);
            expect(result).toBe(unsub);
        });
    });

    describe("createTask", () => {
        it("throws when templateId or columnId is missing", async () => {
            await expect(
                templateColumnService.createTask("", "c1", { name: "Task" })
            ).rejects.toThrow("Template ID and Column ID are required to create a task");
        });

        it("sets task order from count and trims fields", async () => {
            getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 1 }) });
            doc.mockReturnValue("taskRef");

            await templateColumnService.createTask("t1", "c1", {
                name: "  Task  ",
                description: "  Desc  ",
            });

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    {
                        type: "SET",
                        ref: "taskRef",
                        data: { name: "Task", description: "Desc", order: 1 },
                    },
                ])
            );
        });
    });

    describe("getTask", () => {
        it("returns null when task does not exist", async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });
            const result = await templateColumnService.getTask("t1", "c1", "t1");
            expect(result).toBeNull();
        });

        it("returns task data when it exists", async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                id: "t1",
                data: () => ({ name: "Task" }),
            });
            const result = await templateColumnService.getTask("t1", "c1", "t1");
            expect(result).toEqual({ id: "t1", name: "Task" });
        });
    });

    describe("deleteTask/updateTask", () => {
        it("deletes a task via batchOps", async () => {
            pathHelper.templateColumnTask.mockReturnValue("taskRef");
            await templateColumnService.deleteTask("t1", "c1", "t1");
            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                [{ type: "DELETE", ref: "taskRef" }]
            );
        });

        it("updates a task via batchOps", async () => {
            pathHelper.templateColumnTask.mockReturnValue("taskRef");
            await templateColumnService.updateTask("t1", "c1", "t1", { name: "New" });
            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                [{ type: "UPDATE", ref: "taskRef", data: { name: "New" } }]
            );
        });
    });

    describe("allColumnsRefsToDelete", () => {
        it("returns delete ops for columns and their tasks", async () => {
            pathHelper.templateColumns.mockReturnValue("colsRef");
            pathHelper.templateColumnTasks.mockImplementation((_t, colId) => `tasks/${colId}`);

            getDocs
                .mockResolvedValueOnce({
                    docs: [
                        makeDoc("c1", {}, "colRef1"),
                        makeDoc("c2", {}, "colRef2"),
                    ],
                })
                .mockResolvedValueOnce({
                    forEach: (cb) => cb({ ref: "taskRef1" }),
                })
                .mockResolvedValueOnce({
                    forEach: (cb) => cb({ ref: "taskRef2" }),
                });

            const ops = await templateColumnService.allColumnsRefsToDelete("t1");

            expect(ops).toEqual(expect.arrayContaining([
                { type: "DELETE", ref: "colRef1" },
                { type: "DELETE", ref: "colRef2" },
                { type: "DELETE", ref: "taskRef1" },
                { type: "DELETE", ref: "taskRef2" },
            ]));
        });
    });

    describe("moveTaskToColumn/reorderColumnTasks", () => {
        it("moves task to a new column with hints", async () => {
            getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 4 }) });
            pathHelper.templateColumnTask.mockImplementation((_t, colId, taskId) => `task/${colId}/${taskId}`);

            await templateColumnService.moveTaskToColumn(
                "t1",
                { id: "t1", name: "Task", description: "Desc", hints: "hint" },
                "c1",
                { id: "c2" }
            );

            const ops = batchOps.mock.calls[0][1];
            expect(ops).toEqual(expect.arrayContaining([
                { type: "DELETE", ref: "task/c1/t1" },
                { type: "SET", ref: "task/c2/t1", data: expect.objectContaining({ order: 4, hints: "hint" }) },
            ]));
        });

        it("reorders only the affected tasks", async () => {
            pathHelper.templateColumnTask.mockImplementation((_t, _c, taskId) => `task/${taskId}`);
            await templateColumnService.reorderColumnTasks(
                "t1",
                "c1",
                [{ id: "a" }, { id: "b" }, { id: "c" }],
                0,
                1
            );

            const ops = batchOps.mock.calls[0][1];
            expect(ops.map((op) => op.data.order)).toEqual([0, 1]);
        });
    });

    describe("hints helpers", () => {
        it("saves and deletes hints", async () => {
            pathHelper.templateColumnTask.mockReturnValue("taskRef");
            await templateColumnService.saveHint("t1", "c1", "t1", "content");
            await templateColumnService.deleteHint("t1", "c1", "t1");

            expect(updateDoc).toHaveBeenCalledWith("taskRef", { hints: "content" });
            expect(updateDoc).toHaveBeenCalledWith("taskRef", { hints: "delete-field" });
        });

        it("returns empty string when hint is missing", async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });
            const hint = await templateColumnService.getHint("t1", "c1", "t1");
            expect(hint).toBe("");
        });

        it("returns false when hints are not present", async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });
            const result = await templateColumnService.hasHints("t1", "c1", "t1");
            expect(result).toBe(false);
        });
    });
});
