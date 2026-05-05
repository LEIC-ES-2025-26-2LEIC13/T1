import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { inviteService } from "../../../api/inviteService"
import { addDoc, deleteDoc, getDocs, getDoc, onSnapshot, runTransaction } from "firebase/firestore"
import { pathHelper } from "../../../api/pathHelper"

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    runTransaction: jest.fn(),
    Timestamp: { now: jest.fn(() => "now") }
}))

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        userInvites: jest.fn(),
        userInvite: jest.fn(),
        projectUser: jest.fn(),
        project: jest.fn(),
        userProject: jest.fn()
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({ 
    db: {} 
}))

describe("inviteService", () => {
    afterEach(() => { 
        jest.clearAllMocks() 
    })

    it("should subscribe to user invites", () => {
        const mockOnUpdate = jest.fn()
        onSnapshot.mockImplementation((query, callback) => {
            callback({ docs: [{ id: "i1", data: () => ({ projectId: "p1" }) }] })
            return "unsubscribe"
        })
        
        const unsub = inviteService.subscribeToUserInvites("u1", mockOnUpdate)
        
        expect(unsub).toBe("unsubscribe")
        expect(mockOnUpdate).toHaveBeenCalledWith([{ id: "i1", projectId: "p1" }])
    })

    it("should throw if invite already sent", async () => {
        getDocs.mockResolvedValueOnce({ empty: false })
        await expect(inviteService.sendInvite({ receiverId: "r1", projectId: "p1" }))
            .rejects.toThrow("Invite already sent to this user for this project")
    })

    it("should throw if user already in project", async () => {
        getDocs.mockResolvedValueOnce({ empty: true })
        getDoc.mockResolvedValueOnce({ exists: () => true })
        await expect(inviteService.sendInvite({ receiverId: "r1", projectId: "p1" }))
            .rejects.toThrow("This user is already in this project")
    })

    it("should send an invite successfully", async () => {
        getDocs.mockResolvedValueOnce({ empty: true }) 
        getDoc.mockResolvedValueOnce({ exists: () => false }) 
        pathHelper.userInvites.mockReturnValue("userInvitesRef")
        
        await inviteService.sendInvite({ 
            senderId: "s1", 
            senderEmail: "s@s.com", 
            receiverId: "r1", 
            projectId: "p1", 
            projectName: "Project 1" 
        })
        
        expect(addDoc).toHaveBeenCalled()
    })

    it("should accept invite successfully", async () => {
        runTransaction.mockImplementation(async (db, callback) => {
            const mockTransaction = {
                get: jest.fn().mockResolvedValue({ exists: () => true, data: () => ({ title: "T", description: "D" }) }),
                delete: jest.fn(),
                set: jest.fn()
            }
            await callback(mockTransaction)
            expect(mockTransaction.delete).toHaveBeenCalled()
            expect(mockTransaction.set).toHaveBeenCalledTimes(2)
        })
        
        await inviteService.acceptInvite("u1", "u@u.com", { id: "i1", projectId: "p1" })
    })

    it("should throw error during accept invite if project does not exist", async () => {
        runTransaction.mockImplementation(async (db, callback) => {
            const mockTransaction = {
                get: jest.fn().mockResolvedValue({ exists: () => false }),
                delete: jest.fn()
            }
            await expect(callback(mockTransaction)).rejects.toThrow("This project no longer exists")
            expect(mockTransaction.delete).toHaveBeenCalled()
        })
        
        await inviteService.acceptInvite("u1", "u@u.com", { id: "i1", projectId: "p1" })
    })

    it("should ignore an invite", async () => {
        pathHelper.userInvite.mockReturnValue("inviteRef")
        await inviteService.ignoreInvite("u1", "i1")
        expect(deleteDoc).toHaveBeenCalledWith("inviteRef")
    })
})