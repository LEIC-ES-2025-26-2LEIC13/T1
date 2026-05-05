import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { taskService } from "../../../api/taskService"
import { addDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { pathHelper } from "../../../api/pathHelper"

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: { now: jest.fn(() => "now") }
}))

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        columnTasks: jest.fn(),
        task: jest.fn()
    }
}))

describe("taskService", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should create a task", async () => {
        pathHelper.columnTasks.mockReturnValue("tasksRef")
        const taskData = { name: "Test Task", description: "Desc", label: "Bug" }

        await taskService.createTask("p1", "c1", taskData)

        expect(pathHelper.columnTasks).toHaveBeenCalledWith("p1", "c1")
        expect(addDoc).toHaveBeenCalledWith("tasksRef", {
            name: "Test Task",
            description: "Desc",
            label: "Bug",
            createdAt: "now"
        })
    })

    it("should throw error if project ID is missing on create task", async () => {
        await expect(taskService.createTask(null, "c1", {}))
            .rejects.toThrow("Project ID is required to create a task")
    })

    it("should delete a task", async () => {
        pathHelper.task.mockReturnValue("taskRef")

        await taskService.deleteTask("p1", "c1", "t1")

        expect(pathHelper.task).toHaveBeenCalledWith("p1", "c1", "t1")
        expect(deleteDoc).toHaveBeenCalledWith("taskRef")
    })

    it("should subscribe to column tasks", () => {
        pathHelper.columnTasks.mockReturnValue("tasksRef")
        const mockOnUpdate = jest.fn()
        const mockSnapshot = {
            docs: [{ id: "t1", data: () => ({ name: "Task 1" }) }]
        }
        
        onSnapshot.mockImplementation((ref, callback) => {
            callback(mockSnapshot)
            return "unsubscribe"
        })

        const unsub = taskService.subscribeToColumnTasks("p1", "c1", mockOnUpdate)

        expect(unsub).toBe("unsubscribe")
        expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "t1", name: "Task 1" }])
    })

    it("should normalize null and undefined fields when creating task", async () => {
        pathHelper.columnTasks.mockReturnValue("tasksRef")

        await taskService.createTask("p1", "c1", { 
            name: null, 
            description: undefined, 
            label: null 
        })

        expect(addDoc).toHaveBeenCalledWith("tasksRef", expect.objectContaining({
            name: "", 
            description: "", 
            label: ""
        }))
    })
})