import { db } from '../firebase/firebaseConfig'
import { doc, collection, addDoc, Timestamp } from "firebase/firestore";
import { createContext, useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState('');

    // this receiver an object
    async function createTask(task) {
        // Task already arrives as an object and trimmed
    
        if (!activeProjectId) {
            throw new Error('Project ID is required to create a task');
        }
        
        // Reference to the project document
        const projectRef = doc(db, 'projects', activeProjectId);
        
        // Reference to the tasks subcollection that will be created
        const taskRef = collection(projectRef, 'tasks');

        await addDoc(taskRef, {
            ...task,
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
