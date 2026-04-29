import { addDoc, collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/Colletions";

function normalizeTaskData({ name, description, label }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
    }
}

export const taskService = {
    subscribeToProjectTasks: (projectId, onUpdate) => {
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        const projectTasksRef = collection(projectRef, SUBCOLLECTIONS.PROJECT_TASKS);

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
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        
        // Reference to the projectTasks subcollection that will be created
        const taskRef = collection(projectRef, SUBCOLLECTIONS.PROJECT_TASKS);

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        });
    }
}
