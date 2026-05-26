import { doc, getDocs, query, orderBy, onSnapshot, runTransaction, getCountFromServer, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { batchOps, OPERATION_TYPES } from "./batchOpsHelper";
import { pathHelper } from "./pathHelper";

function normalizeColumnData({ name }) {
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

function normalizeTemplateTaskData({ name, description }) {
    return {
        name: name?.trim() ?? '',
        description: description?.trim() ?? '',
    }
}

export const templateColumnService = {
    // Subscribe to template columns
    subscribeToTemplateColumns: (templateId, onUpdate) => {
        const templateColumnsRef = pathHelper.templateColumns(templateId)
        const templateColumns = query(templateColumnsRef, orderBy('order', 'asc'));

        return onSnapshot(templateColumns, (snapshot) => {
            const columnsToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(columnsToDisplay);
        });
    },

    createColumn: async (templateId, columnData) => {
        if (!templateId) {
            throw new Error('Template ID is required to create a column')
        }

        const normalizedColumnData = normalizeColumnData(columnData)
        const templateRef = pathHelper.template(templateId)

        await runTransaction(db, async (transaction) => {
            const templateSnap = await transaction.get(templateRef)
            const newColumnOrder = templateSnap.data().columnCount + 1

            transaction.update(templateRef, { columnCount: newColumnOrder })

            const newColumnRef = doc(pathHelper.templateColumns(templateId))

            transaction.set(newColumnRef, {
                ...normalizedColumnData,
                order: newColumnOrder,
            })
        })
    },

    deleteColumn: async (templateId, columnId) => {
        const operations = []

        const columnTasksRef = pathHelper.templateColumnTasks(templateId, columnId)
        const columnTasksSnapshot = await getDocs(columnTasksRef)

        columnTasksSnapshot.forEach((taskDoc) => {
            operations.push({ type: OPERATION_TYPES.DELETE, ref: taskDoc.ref })
        })

        const columnRef = pathHelper.templateColumn(templateId, columnId)
        operations.push({
            type: OPERATION_TYPES.DELETE,
            ref: columnRef
        })

        await batchOps(db, operations)
    },

    updateColumn: async (templateId, columnId, updates) => {
        const { name } = normalizeColumnUpdates(updates)
        if (!name) {
            return // no updates
        }

        const operations = []

        operations.push({
            type: OPERATION_TYPES.UPDATE,
            ref: pathHelper.templateColumn(templateId, columnId),
            data: { name }
        })

        await batchOps(db, operations)
    },

    subscribeToColumnTasks: (templateId, columnId, onUpdate) => {
        const columnTasksRef = pathHelper.templateColumnTasks(templateId, columnId)
        const columnTasks = query(columnTasksRef, orderBy('order', 'asc'));

        return onSnapshot(columnTasks, (snapshot) => {
            const tasksToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(tasksToDisplay);
        });
    },

    createTask: async (templateId, columnId, taskData) => {
        if (!templateId || !columnId) {
            throw new Error('Template ID and Column ID are required to create a task')
        }

        const normalizedTaskData = normalizeTemplateTaskData(taskData)

        const existingTasks = await getCountFromServer(pathHelper.templateColumnTasks(templateId, columnId))
        const taskOrder = existingTasks.data().count
        

        if (!normalizedTaskData.name) {
            throw new Error('Task name cannot be empty')
        }

        const newTaskRef = doc(pathHelper.templateColumnTasks(templateId, columnId))

        const operations = [
            {
                type: OPERATION_TYPES.SET,
                ref: newTaskRef,
                data: {
                    ...normalizedTaskData,
                    order: taskOrder
                }
            }
        ]

        await batchOps(db, operations)
    },

    getTask: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)
        const taskSnap = await getDoc(taskRef)
        if (!taskSnap.exists()) {
            return null
        }
        return { id: taskSnap.id, ...taskSnap.data() }
    },

    deleteTask: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)

        const operations = [
            { type: OPERATION_TYPES.DELETE, ref: taskRef }
        ]

        await batchOps(db, operations)
    },

    updateTask: async (templateId, columnId, taskId, updates) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)

        const operations = [
            {
                type: OPERATION_TYPES.UPDATE,
                ref: taskRef,
                data: updates
            }
        ]

        await batchOps(db, operations)
    },

    allColumnsRefsToDelete: async (templateId) => {
        const operations = []

        const templateColumnsRef = pathHelper.templateColumns(templateId)
        const templateColumnsSnapshot = await getDocs(templateColumnsRef)

        for (const columnDoc of templateColumnsSnapshot.docs) {
            const columnRef = columnDoc.ref
            operations.push({ type: OPERATION_TYPES.DELETE, ref: columnRef })

            const columnTasksRef = pathHelper.templateColumnTasks(templateId, columnDoc.id)
            const columnTasksSnapshot = await getDocs(columnTasksRef)
            columnTasksSnapshot.forEach((taskDoc) => {
                operations.push({ type: OPERATION_TYPES.DELETE, ref: taskDoc.ref })
            })
        }

        return operations;
    },

     moveTaskToColumn: async (templateId, task, fromColumnId, toColumn) => {
        const existingTasks = await getCountFromServer(pathHelper.templateColumnTasks(templateId, toColumn.id))
        const newOrder = existingTasks.data().count

        const operations = []

        // 1. Delete from old column
        operations.push({
            type: OPERATION_TYPES.DELETE,
            ref: pathHelper.templateColumnTask(templateId, fromColumnId, task.id)
        })

        // 2. Create in new column, reusing same task ID
        const newTaskData = {
            name: task.name,
            description: task.description,
            order: newOrder,
        };

        if (task.hints !== undefined) {
            newTaskData.hints = task.hints;
        }

        operations.push({
            type: OPERATION_TYPES.SET,
            ref: pathHelper.templateColumnTask(templateId, toColumn.id, task.id),
            data: newTaskData
        })

        await batchOps(db, operations)  
    },

    reorderColumnTasks: async (templateId, columnId, reorderedTasks, from, to) => {
        const [start, end] = from < to ? [from, to] : [to, from]; // only considers the affected range (to reduce the number of updates needed)
        const affected = reorderedTasks.slice(start, end + 1); // finds the new order of the affected tasks
        // the index starts on start, the ordering is updated from that point onwards, by simply summing with the index, as start represents the lowest
        // index of the affected range, the index of the lowest task (considering the original order)
        const operations = affected.map((task, index) => ({
            type: OPERATION_TYPES.UPDATE,
            ref: pathHelper.templateColumnTask(templateId, columnId, task.id),
            data: { order: start + index }
        }));

        await batchOps(db, operations);
    },

    saveHint: async (templateId, columnId, taskId, hintsContent) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)
        await updateDoc(taskRef, { hints: hintsContent })
    },

    getHint: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)
        const taskSnap = await getDoc(taskRef)
        return taskSnap.exists() ? taskSnap.data().hints : ''
    },

   hasHints: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId);
        const taskSnap = await getDoc(taskRef);
        if (!taskSnap.exists()) return false;

        return taskSnap.data().hints !== undefined
    },

    deleteHint: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.templateColumnTask(templateId, columnId, taskId)
        await updateDoc(taskRef, { hints: deleteField() }) // deletes the hints field if it exists, if it doesn't exist it does nothing
    }
}
