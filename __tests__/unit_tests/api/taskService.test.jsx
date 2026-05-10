import { jest, describe, it, expect, afterEach } from "@jest/globals";
import { taskService } from "../../../api/taskService";
import { addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: { now: jest.fn(() => "now") },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        columnTasks: jest.fn(),
        task: jest.fn(),
    },
}));

describe("taskService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createTask", () => {
        it("should create a task with all fields", async () => {
            pathHelper.columnTasks.mockReturnValue("tasksRef");
            const taskData = {
                name: "Test Task",
                description: "Desc",
                label: "urgent",
                assignedMembers: [{ id: "u1", email: "user@example.com" }],
            };

            await taskService.createTask("p1", "c1", taskData);

            expect(addDoc).toHaveBeenCalledWith(
                "tasksRef",
                expect.objectContaining({
                    name: "Test Task",
                    description: "Desc",
                    label: "urgent",
                }),
            );
        });

        it("should normalize and trim fields on create", async () => {
            pathHelper.columnTasks.mockReturnValue("tasksRef");

            await taskService.createTask("p1", "c1", {
                name: "  Task  ",
                description: undefined,
                label: null,
                assignedMembers: undefined,
            });

            expect(addDoc).toHaveBeenCalledWith(
                "tasksRef",
                expect.objectContaining({
                    name: "Task",
                    description: "",
                    label: "",
                    assignedMembers: [],
                }),
            );
        });

        it("should throw error if project ID is missing", async () => {
            await expect(
                taskService.createTask(null, "c1", {}),
            ).rejects.toThrow("Project ID is required to create a task");
        });

        it("should format assigned members correctly", async () => {
            pathHelper.columnTasks.mockReturnValue("tasksRef");

            await taskService.createTask("p1", "c1", {
                name: "Task",
                assignedMembers: [
                    { id: "u1", email: "user1@example.com", extra: "ignored" },
                    { id: "u2", email: "user2@example.com" },
                ],
            });

            expect(addDoc).toHaveBeenCalledWith(
                "tasksRef",
                expect.objectContaining({
                    assignedMembers: [
                        { id: "u1", email: "user1@example.com" },
                        { id: "u2", email: "user2@example.com" },
                    ],
                }),
            );
        });
    });

    describe("deleteTask", () => {
        it("should delete a task successfully", async () => {
            pathHelper.task.mockReturnValue("taskRef");

            await taskService.deleteTask("p1", "c1", "t1");

            expect(pathHelper.task).toHaveBeenCalledWith("p1", "c1", "t1");
            expect(deleteDoc).toHaveBeenCalledWith("taskRef");
        });

        it("should handle Firebase delete errors", async () => {
            pathHelper.task.mockReturnValue("taskRef");
            deleteDoc.mockRejectedValue(new Error("Firebase error"));

            await expect(
                taskService.deleteTask("p1", "c1", "t1"),
            ).rejects.toThrow("Firebase error");
        });
    });

    describe("subscribeToColumnTasks", () => {
        it("should subscribe to tasks and handle updates", () => {
            pathHelper.columnTasks.mockReturnValue("tasksRef");
            const mockOnUpdate = jest.fn();
            let callbackFunction;

            onSnapshot.mockImplementation((ref, callback) => {
                callbackFunction = callback;
                return jest.fn();
            });

            const unsub = taskService.subscribeToColumnTasks(
                "p1",
                "c1",
                mockOnUpdate,
            );

            // First update
            callbackFunction({
                docs: [{ id: "t1", data: () => ({ name: "Task 1" }) }],
            });
            expect(mockOnUpdate).toHaveBeenCalledWith([
                { id: "t1", name: "Task 1" },
            ]);

            // Empty update
            callbackFunction({ docs: [] });
            expect(mockOnUpdate).toHaveBeenCalledWith([]);

            // Unsubscribe
            expect(unsub).toEqual(expect.any(Function));
        });

        it("should use correct path reference", () => {
            pathHelper.columnTasks.mockReturnValue("tasksRef");

            onSnapshot.mockImplementation((ref, callback) => {
                callback({ docs: [] });
                return jest.fn();
            });

            taskService.subscribeToColumnTasks("p1", "c1", jest.fn());

            expect(pathHelper.columnTasks).toHaveBeenCalledWith("p1", "c1");
            expect(onSnapshot).toHaveBeenCalledWith(
                "tasksRef",
                expect.any(Function),
            );
        });
    });
});
