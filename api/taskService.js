import { addDoc, deleteDoc, collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

function normalizeTaskData({ name, description, label }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
    }
}

export const taskService = {
    subscribeToProjectTasks: (projectId, onUpdate) => {
        const projectRef = doc(db, 'projects', projectId);
        const projectTasksRef = collection(projectRef, 'projectTasks');

        return onSnapshot(projectTasksRef, (snapshot) => {
            const taskList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(taskList);
        });
    },

    createTask: async (projectId, taskData) => {
        if (!projectId) {
            throw new Error('Project ID is required to create a task');
        }

        const normalizedTaskData = normalizeTaskData(taskData);
        
        // Reference to the project document
        const projectRef = doc(db, 'projects', projectId);
        
        // Reference to the projectTasks subcollection that will be created
        const taskRef = collection(projectRef, 'projectTasks');

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        });
    },

    deleteTask: async (projectId, taskId) => {
        const taskDocRef = doc(db, 'projects', projectId, 'projectTasks', taskId);
        await deleteDoc(taskDocRef);
    }
}

