import { doc, getCountFromServer, onSnapshot, Timestamp, writeBatch, orderBy, query } from "firebase/firestore";
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

        const queryRef = query(columnTasksRef, orderBy('order', 'asc'));

        return onSnapshot(queryRef, (snapshot) => {
            const tasksToDisplay = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))

            onUpdate(tasksToDisplay);
        });
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

        const existingTasks = await getCountFromServer(pathHelper.columnTasks(projectId, columnId))

        const taskOrder = existingTasks.data().count

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
            order: taskOrder,
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
    },

    reorderColumnTasks: async (projectId, columnId, reorderedTasks, from, to) => {
        const [start, end] = from < to ? [from, to] : [to, from]; // only considers the affected range (to reduce the number of updates needed)
        const affected = reorderedTasks.slice(start, end + 1); // finds the new order of the affected tasks
        // the index starts on start, the ordering is updated from that point onwards, by simply summing with the index, as start represents the lowest
        // index of the affected range, the index of the lowest task (considering the original order)
        const operations = affected.map((task, index) => ({
            type: OPERATION_TYPES.UPDATE,
            ref: pathHelper.columnTask(projectId, columnId, task.id),
            data: { order: start + index }
        }));

        await batchOps(db, operations);
    },

    moveTaskToColumn: async (projectId, task, fromColumnId, toColumn) => {
        const existingTasks = await getCountFromServer(pathHelper.columnTasks(projectId, toColumn.id))
        const newOrder = existingTasks.data().count

        const operations = []

        // 1. Delete from old column
        operations.push({
            type: OPERATION_TYPES.DELETE,
            ref: pathHelper.columnTask(projectId, fromColumnId, task.id)
        })

        // 2. Create in new column, reusing same task ID
        operations.push({
            type: OPERATION_TYPES.SET,
            ref: pathHelper.columnTask(projectId, toColumn.id, task.id),
            data: {
                name: task.name,
                description: task.description,
                label: task.label,
                assignedMembers: task.assignedMembers,
                order: newOrder,
                createdAt: task.createdAt
            }
        })

        // 3. Update userTask copies to reflect new column
        for (const { id: memberId } of (task.assignedMembers ?? [])) {
            operations.push({
                type: OPERATION_TYPES.UPDATE,
                ref: pathHelper.userTask(memberId, task.id),
                data: {
                    columnId: toColumn.id,
                    columnName: toColumn.name
                }
            })
        }

        await batchOps(db, operations)  
    },

    updateTask: async (projectId, columnId, taskId, taskData) => {
        const normalizedTaskData = normalizeTaskData(taskData)
        const operations = []

        // Update task in column
        operations.push({
            type: OPERATION_TYPES.UPDATE,
            ref: pathHelper.columnTask(projectId, columnId, taskId),
            data: normalizedTaskData
        })

        // Update task in each assigned member's user tasks
        if (taskData.assignedMembers && taskData.assignedMembers.length > 0) {
            for (const { id: memberId } of taskData.assignedMembers) {
                operations.push({
                    type: OPERATION_TYPES.UPDATE,
                    ref: pathHelper.userTask(memberId, taskId),
                    data: normalizedTaskData
                })
            }
        }

        await batchOps(db, operations)
    },
}
