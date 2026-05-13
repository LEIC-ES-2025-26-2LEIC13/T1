import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { projectService } from "../../../api/projectService"
import { updateDoc, getDocs, writeBatch, onSnapshot } from "firebase/firestore"
import { batchOps } from "../../../api/batchOpsHelper"  // ← was batchDelete; source uses batchOps
import { columnService } from "../../../api/columnService"

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: "mockDocId" })),
    updateDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(q => q),
    where: jest.fn(),
    onSnapshot: jest.fn(),
    writeBatch: jest.fn()
}))

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn(),
    OPERATION_TYPES: {
        DELETE: "DELETE",
        UPDATE: "UPDATE"
    }
}))

jest.mock("../../../api/columnService", () => ({
    columnService: { allColumnsRefsToDelete: jest.fn() }
}))

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        userProjects: jest.fn(),
        projectUsers: jest.fn(),
        userProject: jest.fn(),
        projectUser: jest.fn(),
        userTasks: jest.fn(),
        columnTask: jest.fn(),
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {}
}))

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: { USERS: "users", PROJECTS: "projects" },
    SUBCOLLECTIONS: { PROJECT_USERS: "project_users", USER_PROJECTS: "user_projects" }
}))

describe("projectService", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should subscribe to user projects", () => {
        const mockOnUpdate = jest.fn()
        onSnapshot.mockImplementation((q, callback) => {
            callback({ docs: [{ id: "p1", data: () => ({ title: "Project" }) }] })
            return jest.fn() // unsubscribe fn
        })

        projectService.subscribeToUserProjects("u1", mockOnUpdate)

        expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "p1", title: "Project" }])
    })

    it("should throw if project title is empty", async () => {
        await expect(projectService.createProject("u1", "u@u.com", { title: "" }))
            .rejects.toThrow("Please enter a project title")
    })

    it("should throw if project title is whitespace only", async () => {
        await expect(projectService.createProject("u1", "u@u.com", { title: "   " }))
            .rejects.toThrow("Please enter a project title")
    })

    it("should create a project", async () => {
        const mockBatch = { set: jest.fn(), commit: jest.fn() }
        writeBatch.mockReturnValue(mockBatch)

        await projectService.createProject("u1", "u1@test.com", { title: "Test Project", description: "Desc" })

        expect(mockBatch.set).toHaveBeenCalledTimes(3) // project + projectUser + userProject
        expect(mockBatch.commit).toHaveBeenCalled()
    })

    it("should return early if update fields are empty", async () => {
        await projectService.updateProject("p1", {})
        expect(updateDoc).not.toHaveBeenCalled()
    })

    it("should update a project title", async () => {
        await projectService.updateProject("p1", { title: "Updated Title" })
        expect(updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            { title: "Updated Title" }
        )
    })

    it("should update only the description if title is left undefined", async () => {
        await projectService.updateProject("p1", { description: "New Description Only" })
        expect(updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            { description: "New Description Only" }
        )
    })

    it("should normalize a null description to empty string during update", async () => {
        await projectService.updateProject("p1", { title: "Valid Title", description: null })
        expect(updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            { title: "Valid Title", description: "" }
        )
    })

    it("should throw if the updated title is empty string, whitespace, or null", async () => {
        await expect(projectService.updateProject("p1", { title: "" }))
            .rejects.toThrow("Project title cannot be empty")

        await expect(projectService.updateProject("p1", { title: " " }))
            .rejects.toThrow("Project title cannot be empty")

        await expect(projectService.updateProject("p1", { title: null }))
            .rejects.toThrow("Project title cannot be empty")
    })

    it("should delete a project and call batchOps with all refs", async () => {
        columnService.allColumnsRefsToDelete.mockResolvedValue([
            { type: "DELETE", ref: "colRef" }
        ])
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => cb({ ref: "userRef", id: "u1" })
        })

        await projectService.deleteProject("p1")

        expect(batchOps).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([
                { type: "DELETE", ref: "colRef" },
                { type: "DELETE", ref: "userRef" },
                expect.objectContaining({ type: "DELETE" }), // userProjectRef
                expect.objectContaining({ type: "DELETE" }), // main project doc
            ])
        )
    })

    it("should get project users", async () => {
        getDocs.mockResolvedValueOnce({
            docs: [{ id: "u1", data: () => ({ email: "u1@test.com" }) }]
        })

        const result = await projectService.getProjectUsers("p1")

        expect(result).toEqual([{ id: "u1", email: "u1@test.com" }])
    })

    it("should kick a member and call batchOps", async () => {
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => cb({
                ref: "taskRef",
                id: "t1",
                data: () => ({
                    columnId: "c1",
                    assignedMembers: [{ id: "u1" }, { id: "u2" }]
                })
            })
        })

        await projectService.kickMember("p1", "u1")

        expect(batchOps).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([
                expect.objectContaining({ type: "DELETE" }), // userProject
                expect.objectContaining({ type: "DELETE" }), // projectUser
                expect.objectContaining({ type: "DELETE", ref: "taskRef" }), // userTask
                expect.objectContaining({
                    type: "UPDATE",
                    data: { assignedMembers: [{ id: "u2" }] } // u1 filtered out
                }),
            ])
        )
    })

    it("should kick a member with no task assignments", async () => {
        getDocs.mockResolvedValueOnce({ forEach: jest.fn() }) // no tasks

        await projectService.kickMember("p1", "u1")

        expect(batchOps).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([
                expect.objectContaining({ type: "DELETE" }), // userProject
                expect.objectContaining({ type: "DELETE" }), // projectUser
            ])
        )
    })

    it("should default assignedMembers to [] when the field is missing on the task", async () => {
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => cb({
                ref: "taskRef",
                id: "t1",
                data: () => ({
                    columnId: "c1",
                    assignedMembers: undefined
                })
            })
        })

        await projectService.kickMember("p1", "u1")

        expect(batchOps).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining([
                expect.objectContaining({
                    type: "UPDATE",
                    data: { assignedMembers: [] }
                })
            ])
        )
    })

    it("should return true if project has no members", async () => {
        getDocs.mockResolvedValueOnce({ empty: true })

        const result = await projectService.projectHasNoMembers("p1")

        expect(result).toBe(true)
    })


    it("should return false if project has members", async () => {
        getDocs.mockResolvedValueOnce({ empty: false })

        const result = await projectService.projectHasNoMembers("p1")

        expect(result).toBe(false)
    })

    it("should trim whitespace from title when creating a project", async () => {
        const mockBatch = { set: jest.fn(), commit: jest.fn() }
        writeBatch.mockReturnValue(mockBatch)

        await projectService.createProject("u1", "u@u.com", { title: "  My Project  " })

        expect(mockBatch.set).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ title: "My Project" }) // .trim() ran
        )
    })

    it("should throw when title is null", async () => {
        await expect(
            projectService.createProject("u1", "u@u.com", { title: null })
        ).rejects.toThrow("Please enter a project title")
    })

    it("should throw when title is undefined", async () => {
        await expect(
            projectService.createProject("u1", "u@u.com", { title: undefined })
        ).rejects.toThrow("Please enter a project title")
    })
})
