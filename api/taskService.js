import { addDoc, deleteDoc,onSnapshot, Timestamp } from "firebase/firestore";
import { pathHelper } from "./pathHelper";

function normalizeTaskData({ name, description, label, assignedMembers }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
        assignedMembers: Array.isArray(assignedMembers) 
            ? assignedMembers.map(m => ({ id: m.id, email: m.email })) 
            : [],
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

    createTask: async (projectId, columnId, taskData) => {
        if (!projectId) {
            throw new Error('Project ID is required to create a task');
        }

        const normalizedTaskData = normalizeTaskData(taskData);

        const taskRef = pathHelper.columnTasks(projectId, columnId);

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        });
    },

    deleteTask: async (projectId, columnId, taskId) => {
        const taskDocRef = pathHelper.task(projectId, columnId, taskId);
            
        await deleteDoc(taskDocRef);
    }
}
