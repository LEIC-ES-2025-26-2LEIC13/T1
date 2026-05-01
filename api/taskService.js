import { addDoc, deleteDoc, collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/Collections";
import { columnService } from "./columnService";

function normalizeTaskData({ name, description, label }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
    }
}

export const taskService = {
    subscribeToColumnTasks: (projectId, columnId, onUpdate) => {
        const columnTasksRef = collection(db, COLLECTIONS.PROJECTS, projectId, 
            SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS)
        
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

        const taskRef = collection(db, COLLECTIONS.PROJECTS, projectId, 
            SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS);

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        });
    },

    deleteTask: async (projectId, columnId, taskId) => {
        const taskDocRef = doc(db, COLLECTIONS.PROJECTS, projectId, 
            SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS, taskId);
        await deleteDoc(taskDocRef);
    }
}
