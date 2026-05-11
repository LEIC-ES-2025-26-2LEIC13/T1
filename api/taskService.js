import { addDoc, deleteDoc,doc,onSnapshot, Timestamp, writeBatch } from "firebase/firestore";
import { pathHelper } from "./pathHelper";
import { db } from "../firebase/firebaseConfig";

function normalizeTaskData({ name, description, label, assignedMembers }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
        assignedMembers: Array.isArray(assignedMembers) ? assignedMembers.map(m => m.email) : [],
    }
}

export const taskService = {
    subscribeToColumnTasks: (projectId, columnId, onUpdate) => {
        const columnTasksRef = pathHelper.columnTasks(projectId, columnId);
        
        return onSnapshot(columnTasksRef, (snapshot) => {
            const tasksToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(tasksToDisplay);
        });
    },

    createTask: async (projectId, projectName, columnId, columnName, taskData) => {
        if (!projectId) {
            throw new Error('Project ID is required to create a task');
        }

        const batch = writeBatch(db) // creates a write batch
        const normalizedTaskData = normalizeTaskData(taskData)
        const creationTimestamp = Timestamp.now()

        // Generates a new random id for a document that doesn't exist yet, returning only a DocumentReference
        const columnTaskRef = doc(pathHelper.columnTasks(projectId, columnId))

        // Get the ID, because same tasks (in different collections) will have the same ID
        const sharedId = columnTaskRef.id

        const assignedMembersIds = taskData.assignedMembers?.map(member => member.id) || []

        for (const memberId of assignedMembersIds) {
            // Returns a DocumentReference with the specified ID (ID is not randomly generated, but the specified one, reusing it)
            const userTasksRef = doc(pathHelper.userTasks(memberId), sharedId)
            
            batch.set(userTasksRef, {
                name: normalizedTaskData.name,
                description: normalizedTaskData.description,
                label: normalizedTaskData.label,
                projectName: projectName,
                columnName: columnName,
                createdAt: creationTimestamp
            })
        }

        batch.set(columnTaskRef, {
            ...normalizedTaskData,
            createdAt: creationTimestamp
        })

        await batch.commit()
    },

    deleteTask: async (projectId, columnId, taskId) => {
        const taskDocRef = pathHelper.task(projectId, columnId, taskId);
            
        await deleteDoc(taskDocRef);
    }
}
