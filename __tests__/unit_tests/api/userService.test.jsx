import { jest, describe, it, expect } from '@jest/globals'
import { userService } from "../../../api/userService"
import { getDocs } from "firebase/firestore"

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
})