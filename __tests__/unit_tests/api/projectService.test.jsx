import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { projectService } from "../../../api/projectService"
import { updateDoc, getDocs, writeBatch, onSnapshot } from "firebase/firestore"
import { batchDelete } from "../../../api/batchDeleteHelper"
import { columnService } from "../../../api/columnService"

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: "mockDocId" })),
    updateDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    onSnapshot: jest.fn(),
    writeBatch: jest.fn()
}))

jest.mock("../../../api/batchDeleteHelper", () => ({ 
    batchDelete: jest.fn() 
}))

jest.mock("../../../api/columnService", () => ({ 
    columnService: { allColumnsRefsToDelete: jest.fn() } 
}))

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: { 
        userProjects: jest.fn(), 
        projectUsers: jest.fn(), 
        userProject: jest.fn(), 
        projectUser: jest.fn() 
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({ 
    db: {} 
}))

jest.mock("../../../constants/Collections", () => ({ 
    COLLECTIONS: {}, 
    SUBCOLLECTIONS: {} 
}))

describe("projectService", () => {
    afterEach(() => { 
        jest.clearAllMocks() 
    })

    it("should subscribe to user projects", () => {
        const mockOnUpdate = jest.fn()
        onSnapshot.mockImplementation((query, callback) => {
            callback({ docs: [{ id: "p1", data: () => ({ title: "Project" }) }] })
        })
        
        projectService.subscribeToUserProjects("u1", mockOnUpdate)
        
        expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "p1", title: "Project" }])
    })

    it("should throw if project title is empty", async () => {
        await expect(projectService.createProject("u1", "u@u.com", { title: "" }))
            .rejects.toThrow("Please enter a project title")
    })

    it("should create a project", async () => {
        const mockBatch = { set: jest.fn(), commit: jest.fn() }
        writeBatch.mockReturnValue(mockBatch)
        
        await projectService.createProject("u1", "u1@test.com", { title: "Test Project", description: "Desc" })
        
        expect(mockBatch.commit).toHaveBeenCalled()
    })

    it("should return early if update fields are empty", async () => {
        await projectService.updateProject("p1", {})
        expect(updateDoc).not.toHaveBeenCalled()
    })

    it("should update a project", async () => {
        await projectService.updateProject("p1", { title: "Updated Title" })
        expect(updateDoc).toHaveBeenCalled()
    })

    it("should delete a project and batch delete all refs", async () => {
        columnService.allColumnsRefsToDelete.mockResolvedValue(["colRef"])
        getDocs.mockResolvedValueOnce({
            forEach: (cb) => cb({ ref: "userRef", id: "u1" })
        })
        
        await projectService.deleteProject("p1")
        
        expect(batchDelete).toHaveBeenCalled()
    })

    it("should get project users", async () => {
        getDocs.mockResolvedValueOnce({ docs: [{ id: "u1", data: () => ({ email: "u1@test.com" }) }] })
        
        const result = await projectService.getProjectUsers("p1")
        
        expect(result).toEqual([{ id: "u1", email: "u1@test.com" }])
    })

    it("should kick member", async () => {
        const mockBatch = { delete: jest.fn(), commit: jest.fn() }
        writeBatch.mockReturnValue(mockBatch)
        
        await projectService.kickMember("p1", "u1")
        
        expect(mockBatch.commit).toHaveBeenCalled()
    })

    it("should check if project has no members", async () => {
        getDocs.mockResolvedValueOnce({ empty: true })
        
        const result = await projectService.projectHasNoMembers("p1")
        
        expect(result).toBe(true)
    })

    it("should normalize a null description during update", async () => {
        await projectService.updateProject("p1", { title: "Valid Title", description: null })
        expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { title: "Valid Title", description: "" })
    })

    it("should update only the description if title is left undefined", async () => {
        await projectService.updateProject("p1", { description: "New Description Only" })
        expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { description: "New Description Only" })
    })

    it("should throw an error if the updated project title is empty, null, or whitespace", async () => {
        await expect(projectService.updateProject("p1", { title: "" }))
            .rejects.toThrow("Project title cannot be empty")

        await expect(projectService.updateProject("p1", { title: " " }))
            .rejects.toThrow("Project title cannot be empty")

        await expect(projectService.updateProject("p1", { title: null }))
            .rejects.toThrow("Project title cannot be empty")
    })
})