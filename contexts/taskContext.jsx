import { db } from '../firebase/firebaseConfig'
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

export const TaskContext = createContext();

const normalizeTaskPayload = (task = {}) => {
    return {
        ...task,
        name: task?.name?.trim() ?? '',
        description: task?.description?.trim() ?? '',
        label: task?.label?.trim() ?? '',
    }
}

const validateTaskPayload = (task = {}) => {
    if (!task.name) {
        throw new Error('Please enter a task name');
    }
}

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState('');

    async function createTask(task) {
        const cleanedTask = normalizeTaskPayload(task);
        validateTaskPayload(cleanedTask);     
        
        // Reference to the project document
        const projectRef = doc(db, 'projects', activeProjectId);
        
        // Reference to the tasks subcollection that will be created
        const taskRef = collection(projectRef, 'tasks');

        await addDoc(taskRef, {
            ...cleanedTask,
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
