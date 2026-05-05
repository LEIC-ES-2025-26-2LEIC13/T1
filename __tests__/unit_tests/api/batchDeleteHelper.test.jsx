import { jest, describe, it, expect } from '@jest/globals'
import { writeBatch } from "firebase/firestore"
import { batchDelete } from "../../../api/batchDeleteHelper"

jest.mock("firebase/firestore", () => ({
    writeBatch: jest.fn()
}))

describe("batchDelete", () => {
    it("should divide refs into batches of 450 and commit", async () => {
        const mockDb = {}
        const mockRefs = Array.from({ length: 500 }, (_, i) => ({ id: i }))

        const mockDelete = jest.fn()
        const mockCommit = jest.fn()

        writeBatch.mockReturnValue({
            delete: mockDelete,
            commit: mockCommit
        })

        await batchDelete(mockDb, mockRefs)

        expect(writeBatch).toHaveBeenCalledTimes(2)
        expect(mockDelete).toHaveBeenCalledTimes(500)
        expect(mockCommit).toHaveBeenCalledTimes(2)
    })
})