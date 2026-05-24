import { doc, getDocs, query, orderBy, onSnapshot, Timestamp, runTransaction } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { batchOps, OPERATION_TYPES } from "./batchOpsHelper";
import { pathHelper } from "./pathHelper";
import { taskService } from "./taskService";

function normalizeColumnData({name}) {
    return {
        name: name?.trim() ?? '',
    };
}

function normalizeColumnUpdates({ name }) {
    if (name !== undefined) {
        name = (name ?? '').trim();
        if (!name) throw new Error('Column name cannot be empty');
    }
    return { name };
}

export const columnService = {
    subscribeToProjectColumns: (projectId, onUpdate) => {
        // Go to the current project's columns
        const projectColumnsRef = pathHelper.projectColumns(projectId)
        // Query existing columns of that project, ordered by the order field
        const projectColumns = query(projectColumnsRef, orderBy('order', 'asc'));

        return onSnapshot(projectColumns, (snapshot) => {
            const columnsToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(columnsToDisplay);
        });
    },

    createColumn: async (projectId, columnData) => {
        if (!projectId) {
            throw new Error('Project ID is required to create a column')
        }
        // Normalize column name
        const normalizedColumnData = normalizeColumnData(columnData)
        const projectRef = pathHelper.project(projectId)
        
        // Will need a run transaction because the column count that is written in the end requires the previous existing value in the database
        await runTransaction(db, async (transaction) => {
            const projectSnap = await transaction.get(projectRef)
            const newColumnOrder = projectSnap.data().columnCount + 1 // Increase order of newly created column (considering the preexisting value)

            // Update the value of column count
            transaction.update(projectRef, { columnCount: newColumnOrder })

            // Generates a new random id for a document that doesn't exist yet
            const newColumnRef = doc(pathHelper.projectColumns(projectId))
            
            // Set the new column document atomically within the transaction
            transaction.set(newColumnRef, {
                ...normalizedColumnData,
                order: newColumnOrder,
                createdAt: Timestamp.now(),
            })
        })
    },

    deleteColumn: async (projectId, columnId) => {
        // Delete column and tasks within that column
        const operations = []
        
        // Get all existing tasks
        const columnTasksRef = pathHelper.columnTasks(projectId, columnId)
        const columnTasksSnapshot = await getDocs(columnTasksRef)
        
        columnTasksSnapshot.forEach((taskDoc) => {
            const taskData = taskDoc.data()
            const assignedMembers = taskData.assignedMembers || []
            
            // Reuse getTaskOps to collect all ops (column + user-level tasks)
            const taskOps = taskService.getTaskRefsToDelete(
                projectId,
                columnId,
                taskDoc.id,
                assignedMembers
            )
            operations.push(...taskOps)
        })

        // Delete the column itself
        const columnRef = pathHelper.projectColumn(projectId, columnId)
        operations.push({
            type: OPERATION_TYPES.DELETE,
            ref: columnRef
        })
        
        // Execute single batch delete for all operations
        await batchOps(db, operations)
    },

    allColumnsRefsToDelete: async (projectId) => {
        const operations = []
        
        const projectColumnsRef = pathHelper.projectColumns(projectId)
        const projectColumnsSnapshot = await getDocs(projectColumnsRef)

        // Must use forEach instead of map because getDocs is async 
        for (const columnDoc of projectColumnsSnapshot.docs) {
            const columnRef = columnDoc.ref
            operations.push({ type: OPERATION_TYPES.DELETE, ref: columnRef })

            // Include all tasks of the column
            const columnTasksRef = pathHelper.columnTasks(projectId, columnDoc.id)
            const columnTasksSnapshot = await getDocs(columnTasksRef)
            columnTasksSnapshot.forEach((columnTaskDoc) => {
                operations.push(...taskService.getTaskRefsToDelete(
                    projectId,
                    columnDoc.id,
                    columnTaskDoc.id,
                    columnTaskDoc.data().assignedMembers || []
                ))
            })
        }

        return operations;
    },

    updateColumn: async (projectId, columnId, updates) => {
        const { name } = normalizeColumnUpdates(updates)
        if (!name) {
            return // no updates
        }

        const operations = []
        
        // 1. Update the column itself
        operations.push({
            type: OPERATION_TYPES.UPDATE,
            ref: pathHelper.projectColumn(projectId, columnId),
            data: { name }
        })

        // 2. Cascade the new columnName to all tasks assigned to users in this column
        const columnTasksRef = pathHelper.columnTasks(projectId, columnId)
        const columnTasksSnapshot = await getDocs(columnTasksRef)

        columnTasksSnapshot.forEach((taskDoc) => {
            const taskData = taskDoc.data()
            const assignedMembers = taskData.assignedMembers || []

            assignedMembers.forEach((member) => {
                operations.push({
                    type: OPERATION_TYPES.UPDATE,
                    ref: pathHelper.userTask(member.id, taskDoc.id),
                    data: { columnName: name }
                })
            })
        })

        await batchOps(db, operations)
    }
}