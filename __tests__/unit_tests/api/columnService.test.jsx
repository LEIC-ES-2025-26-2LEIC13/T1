import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { columnService } from "../../../api/columnService"
import { addDoc, getDocs, updateDoc, runTransaction, onSnapshot } from "firebase/firestore"
import { batchDelete } from "../../../api/batchDeleteHelper"
import { pathHelper } from "../../../api/pathHelper"

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(), 
    getDocs: jest.fn(), 
    updateDoc: jest.fn(), 
    query: jest.fn(),
    orderBy: jest.fn(), 
    onSnapshot: jest.fn(), 
    runTransaction: jest.fn(),
    Timestamp: { now: jest.fn(() => "now") }
}))

jest.mock("../../../api/batchDeleteHelper", () => ({ 
    batchDelete: jest.fn() 
}))

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: { 
        projectColumns: jest.fn(), 
        projectColumn: jest.fn(), 
        project: jest.fn(), 
        columnTasks: jest.fn() 
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({ 
    db: {} 
}))

describe("columnService", () => {
    afterEach(() => { 
        jest.clearAllMocks() 
    })

    it("should subscribe to project columns", () => {
        const mockOnUpdate = jest.fn()
        onSnapshot.mockImplementation((query, callback) => {
            callback({ docs: [{ id: "c1", data: () => ({ name: "Col" }) }] })
        })
        
        columnService.subscribeToProjectColumns("p1", mockOnUpdate)
        
        expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "c1", name: "Col" }])
    })

    it("should throw error if project ID missing in createColumn", async () => {
        await expect(columnService.createColumn(null, { name: "Col" }))
            .rejects.toThrow("Project ID is required to create a column")
    })

    it("should create a column", async () => {
        runTransaction.mockImplementation(async (db, callback) => {
            await callback({ 
                get: jest.fn().mockResolvedValue({ data: () => ({ columnCount: 2 }) }), 
                update: jest.fn() 
            })
        })
        
        await columnService.createColumn("p1", { name: "New Column" })
        
        expect(addDoc).toHaveBeenCalled()
    })

    it("should delete a column", async () => {
        getDocs.mockResolvedValueOnce({ forEach: (cb) => cb({ ref: "taskRef1" }) })
        
        await columnService.deleteColumn("p1", "c1")
        
        expect(batchDelete).toHaveBeenCalled()
    })

    it("should return all refs to delete for all columns", async () => {
        getDocs.mockResolvedValueOnce({ docs: [{ id: "c1", ref: "colRef1" }] }) 
        getDocs.mockResolvedValueOnce({ forEach: (cb) => cb({ ref: "taskRef1" }) }) 
        
        const refs = await columnService.allColumnsRefsToDelete("p1")
        
        expect(refs).toEqual(["colRef1", "taskRef1"])
    })

    it("should return early if name is missing in updateColumn", async () => {
        await columnService.updateColumn("p1", "c1", {})
        expect(updateDoc).not.toHaveBeenCalled()
    })

    it("should update a column", async () => {
        await columnService.updateColumn("p1", "c1", { name: "Updated Column" })
        expect(updateDoc).toHaveBeenCalled()
    })

    it("should throw error if updated column name is empty", async () => {
        await expect(columnService.updateColumn("p1", "c1", { name: " " }))
            .rejects.toThrow("Column name cannot be empty")
    })

    it("should throw error if new column name is empty or undefined", async () => {
        await expect(columnService.updateColumn("p1", "c1", { name: null }))
            .rejects.toThrow("Column name cannot be empty")
    })

    it("should normalize a null name when creating a column", async () => {
        runTransaction.mockImplementation(async (db, callback) => {
            await callback({ 
                get: jest.fn().mockResolvedValue({ data: () => ({ columnCount: 2 }) }), 
                update: jest.fn() 
            })
        })
        pathHelper.projectColumns.mockReturnValue("projectColumnsRef")

        await columnService.createColumn("p1", { name: null })

        expect(addDoc).toHaveBeenCalledWith("projectColumnsRef", expect.objectContaining({
            name: ""
        }))
    })
})