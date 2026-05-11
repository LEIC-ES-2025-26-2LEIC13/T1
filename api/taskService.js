import { doc, onSnapshot, Timestamp, writeBatch } from "firebase/firestore";
import { pathHelper } from "./pathHelper";
import { db } from "../firebase/firebaseConfig";
import { batchOps, OPERATION_TYPES } from "./batchOpsHelper";

function normalizeTaskData({ name, description, label, assignedMembers }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
        label: label?.trim() ?? '',
        assignedMembers: assignedMembers ?? []
    }
}

export const taskService = {
    subscribeToColumnTasks: (projectId, columnId, onUpdate) => {
        const columnTasksRef = pathHelper.columnTasks(projectId, columnId);
        
        return onSnapshot(columnTasksRef, (snapshot) => {
            const tasksToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))

            onUpdate(tasksToDisplay)
        })
    },

    subscribeToUserTasks: (userId, onUpdate) => {
        const userTasksRef = pathHelper.userTasks(userId);

        return onSnapshot(userTasksRef, (snapshot) => {
            const tasksToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })).sort((task1, task2) => {
                if (task1.projectName === task2.projectName) 
                    return task1.label.localeCompare(task2.label) // localCompare to compare two srings. If same project, sort by label

                return task1.projectName.localeCompare(task2.projectName) // sort by project name
            })

            onUpdate(tasksToDisplay)
        })
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
                ...normalizedTaskData,
                projectId: projectId,
                projectName: projectName,
                columnId: columnId,
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

    getTaskRefsToDelete: (projectId, columnId, taskId, assignedMembers) => {
        // Include task from the column
        const operations = []
        operations.push({
            type: OPERATION_TYPES.DELETE,
            ref: pathHelper.columnTask(projectId, columnId, taskId)
        })

        // Include the same tasks from the userTasks subcollection of each assigned member
        if (assignedMembers.length > 0) {
            for (const { id: memberId } of assignedMembers) {
                operations.push({
                    type: OPERATION_TYPES.DELETE,
                    ref: pathHelper.userTask(memberId, taskId)
                })
            }
        }

        return operations
    },

    deleteTask: async (projectId, columnId, taskId, assignedMembers) => {
        // Delete task from the column
        const operations = taskService.getTaskRefsToDelete(projectId, columnId, taskId, assignedMembers)

        // Execute batch delete for all operations
        await batchOps(db, operations)
    }
}
