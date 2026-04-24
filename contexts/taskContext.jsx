import { db } from '../firebase/firebaseConfig'
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

export const TaskContext = createContext();

function normalizeTaskData(taskData = {}) {
    return {
        ...taskData,
        name: taskData?.name?.trim() ?? '',
        description: taskData?.description?.trim() ?? '',
        label: taskData?.label?.trim() ?? '',
    }
}

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState('');

    async function createTask(taskData) {
        if (!activeProjectId) {
            throw new Error('Project ID is required to create a task');
        }
        const normalizedTaskData = normalizeTaskData({ ...taskData });
        
        // Reference to the project document
        const projectRef = doc(db, 'projects', activeProjectId);
        
        // Reference to the tasks subcollection that will be created
        const taskRef = collection(projectRef, 'tasks');

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        })
    }

    // updates the tasks
    useEffect(() => {
        if(!activeProjectId) {
            setTasks([]);
            return;
        }
        
        const projectRef = doc(db, 'projects', activeProjectId);
        const taskRef = collection(projectRef, 'tasks');

        const unsub = onSnapshot(taskRef, (snapshot) => {
            const taskList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            setTasks(taskList);
        });

        return () => unsub();

    }, [activeProjectId])

    return (
        <TaskContext.Provider value={{ tasks, createTask, activeProjectId, setActiveProjectId }}>
            {children}
        </TaskContext.Provider>
    )
}
