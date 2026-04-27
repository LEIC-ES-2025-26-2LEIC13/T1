import { writeBatch } from "firebase/firestore"
import { batchDelete } from "../../../api/batchDeleteHelper"

// Setup mocks
const mockDelete = jest.fn()
const mockCommit = jest.fn().mockResolvedValue(true) // Value returned from a successfull promise

jest.mock('firebase/firestore', () => ({
    // This arrow function returns a fake js object
    writeBatch: jest.fn(() => ({
        // .delete() will call mock delete instead of the real implementation
        delete: mockDelete,
        commit: mockCommit,
    }))
}))

describe('Batch delete helper tests', () =>{
    beforeEach(() => {
        jest.clearAllMocks();
    })
    it('should ignore empty deleteRefs', async () => {
        const deleteRefs = []
        const fakeDb = {}

        await batchDelete(fakeDb, deleteRefs)

        expect (writeBatch).not.toHaveBeenCalled();
    })
    it('should delete in batches of 450 elements', async () => {
        // Create array with 1000 elements
        const deleteRefs = Array.from({length: 1000}, (_, i) => ({id: `doc_${i}`}))
        const fakeDb = {}

        await batchDelete(fakeDb, deleteRefs)

        // 1000 / 450 (at least 3 batches needed)
        expect(writeBatch).toHaveBeenCalledTimes(3)

        // each of the elements should be queued for deletion so 1000 elements in total        
        expect(mockDelete).toHaveBeenCalledTimes(1000)

        // One commit for each batch, so 3 commits total
        expect(mockCommit).toHaveBeenCalledTimes(3)
    })
    it('should work for edge cases', async () => {
        // Create array with 1000 elements
        const deleteRefs = Array.from({length: 451}, (_, i) => ({id: `doc_${i}`}))
        const fakeDb = {}

        await batchDelete(fakeDb, deleteRefs)


        expect(writeBatch).toHaveBeenCalledTimes(2)
       
        expect(mockDelete).toHaveBeenCalledTimes(451)

        expect(mockCommit).toHaveBeenCalledTimes(2)
    })
})