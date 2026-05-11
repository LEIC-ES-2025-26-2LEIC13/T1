import { writeBatch } from "firebase/firestore";

// This helper function allows for batch operations of multiple documents, while keeping the number of operations
// per batch commit under the limit of 500 (imposed by firebase). Guarantees atomicity
export async function batchOps(db, operations) { 
    const BATCH_SIZE = 450;
    // The loop "slices" the refs to calculate the number of batches needed
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        const batch = writeBatch(db); // object is redeclared because it cannot be reused after commit 
        const chunk = operations.slice(i, i + BATCH_SIZE);

        // Queueing the operations
        chunk.forEach(({ type, ref, data }) => {
            if (type === 'delete') batch.delete(ref)
            else if (type === 'update') batch.update(ref, data)
            else if (type === 'set') batch.set(ref, data)
        })

        // Execution of the batch
        await batch.commit()
    }
}

export const OPERATION_TYPES = {
    DELETE: 'delete',
    UPDATE: 'update',
    SET: 'set'
}
