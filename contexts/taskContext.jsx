import { createContext, useState, useEffect } from "react";
import { taskService } from '../api/taskService';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState('');

    // Updates project tasks
    useEffect(() => {
        if(!activeProjectId) {
            setTasks([]);
            return
        }
        
        const unsub = taskService.subscribeToProjectTasks(activeProjectId, setTasks)

        return () => unsub();

    }, [activeProjectId])


    async function createTask(taskData) {
        await taskService.createTask(activeProjectId, taskData);
    }

    return (
        <TaskContext.Provider value={{ tasks, createTask, activeProjectId, setActiveProjectId }}>
            {children}
        </TaskContext.Provider>
    )
}
