import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { authService } from "../../../api/authService"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { setDoc } from "firebase/firestore"
import { auth } from "../../../firebase/firebaseConfig"

jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
}))

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    setDoc: jest.fn()
}))

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {},
    auth: { currentUser: { uid: "testUid" } }
}))

describe("authService", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should login user and call onUpdate", async () => {
        const mockUser = { uid: "testUid", email: "test@test.com" }
        signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser })
        const mockOnUpdate = jest.fn()

        await authService.login("test@test.com", "password123", mockOnUpdate)

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@test.com", "password123")
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUser)
    })

    it("should register user and call onUpdate", async () => {
        const mockUser = { uid: "testUid", email: "test@test.com" }
        createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser })
        const mockOnUpdate = jest.fn()

        await authService.register("test@test.com", "password123", mockOnUpdate)

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@test.com", "password123")
        expect(mockOnUpdate).toHaveBeenCalledWith(mockUser)
        expect(setDoc).toHaveBeenCalled()
    })

    it("should logout user", async () => {
        await authService.logout()
        expect(signOut).toHaveBeenCalledWith(auth)
    })

    it("should subscribe to auth state", () => {
        const mockOnUpdate = jest.fn()
        onAuthStateChanged.mockImplementation((auth, cb) => {
            cb({ uid: "user1" })
            return "unsubscribe"
        })
        
        const unsub = authService.subscribeAuthState(mockOnUpdate)
        
        expect(unsub).toBe("unsubscribe")
        expect(mockOnUpdate).toHaveBeenCalledWith({ uid: "user1" })
    })

    it("should skip adding user to database if currentUser is missing after register", async () => {
        const mockOnUpdate = jest.fn()
        createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { email: "test@test.com" } })
        auth.currentUser = null 

        await authService.register("test@test.com", "password123", mockOnUpdate)

        expect(setDoc).not.toHaveBeenCalled()
        auth.currentUser = { uid: "testUid" }
    })
})