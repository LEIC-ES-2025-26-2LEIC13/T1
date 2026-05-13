import { jest, describe, it, expect, afterEach } from '@jest/globals'
import { userService } from "../../../api/userService"
import { getDocs, where, limit } from "firebase/firestore"

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    getDocs: jest.fn()
}))

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {}
}))

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: { USERS: "users" }
}))

describe("userService", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should return user if found by email", async () => {
        const mockUserData = { email: "test@test.com", name: "John" }
        getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [{ id: "u1", data: () => mockUserData }]
        })

        const result = await userService.getUserByEmail("test@test.com")

        expect(result).toEqual({ id: "u1", ...mockUserData })
        expect(getDocs).toHaveBeenCalled()
    })

    it("should return null if user not found", async () => {
        getDocs.mockResolvedValueOnce({ empty: true })

        const result = await userService.getUserByEmail("notfound@test.com")

        expect(result).toBeNull()
    })

    // ── new coverage ────────────────────────────────────────────────────────

    it("should query by the exact email using where and limit(1)", async () => {
        getDocs.mockResolvedValueOnce({ empty: true })

        await userService.getUserByEmail("test@test.com")

        expect(where).toHaveBeenCalledWith('email', '==', 'test@test.com')
        expect(limit).toHaveBeenCalledWith(1)
    })

    it("should return only the first document even if multiple exist", async () => {
        // Confirms limit(1) intent — only docs[0] is ever read
        const first  = { id: "u1", data: () => ({ email: "a@test.com" }) }
        const second = { id: "u2", data: () => ({ email: "a@test.com" }) }
        getDocs.mockResolvedValueOnce({ empty: false, docs: [first, second] })

        const result = await userService.getUserByEmail("a@test.com")

        expect(result.id).toBe("u1")
    })

    it("should return a user with no extra fields beyond id", async () => {
        // Tests spread of empty data() — result should only have id
        getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [{ id: "u1", data: () => ({}) }]
        })

        const result = await userService.getUserByEmail("test@test.com")

        expect(result).toEqual({ id: "u1" })
    })

    it("should propagate errors thrown by getDocs", async () => {
        getDocs.mockRejectedValueOnce(new Error("Firestore unavailable"))

        await expect(userService.getUserByEmail("test@test.com"))
            .rejects.toThrow("Firestore unavailable")
    })
})