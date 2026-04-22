import { db } from '../firebase/firebaseConfig'
import { useUser } from '../hooks/useUser'
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

export const TaskProvider = ({ children, projectId }) => {
    const [ tasks, setTasks ] = useState([]);
    const { user } = useUser();

    async function createTask(taskData, projectId) {
        // need to add a doc to projects 
        // id of the project is passed via route
        const normalizedTaskData = normalizeTaskData(taskData);
        
        // Reference to the project document
        const projectRef = doc(db, 'projects', projectId);
        
        // Reference to the tasks subcollection that will be created
        const taskRef = collection(projectRef, 'tasks');

        await addDoc(taskRef, {
            ...normalizedTaskData,
            createdAt: Timestamp.now(),
        })
    }

    // updates the tasks
    useEffect(() => {
        if(!projectId) return;
        
        const projectRef = doc(db, 'projects', projectId);
        const taskRef = collection(projectRef, 'tasks');

        const unsub = onSnapshot(taskRef, (snapshot) => {
            const taskList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            setTasks(taskList);
        });

        return () => unsub();

    }, [projectId])

    return (
        <TaskContext.Provider value={{ tasks, createTask }}>
            {children}
        </TaskContext.Provider>
    )
}