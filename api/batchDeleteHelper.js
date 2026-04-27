import { writeBatch } from "firebase/firestore";

// This helper function allows batch delete of multiple documents, while keeping the number of operations
// per batch commit under the limit of 500 (imposed by firebase). Guarantees atomicity
export async function batchDelete(db, refsToDelete) { 
    const BATCH_SIZE = 450;
    // The loop "slices" the refs to calculate the number of batches needed
    for (let i = 0; i < refsToDelete.length; i += BATCH_SIZE) {
        const batch = writeBatch(db); // object is redeclared because it cannot be reused after commit 
        const chunk = refsToDelete.slice(i, i + BATCH_SIZE);
        // Queueing the deletions
        chunk.forEach((ref) => {
            batch.delete(ref);
        });
        // Execution of the batch
        await batch.commit(); // For each batch commit the deletions
    }
}