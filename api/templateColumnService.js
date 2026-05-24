import { doc, getDocs, query, orderBy, onSnapshot, Timestamp, runTransaction } from "firebase/firestore";
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

function normalizeTemplateTaskData({ title, description }) {
    return {
        title: title?.trim() ?? '',
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
                createdAt: Timestamp.now(),
            })
        })
    },

    deleteColumn: async (templateId, columnId) => {
        const operations = []

        const columnTasksRef = pathHelper.columnTemplates(templateId, columnId)
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
        const columnTasksRef = pathHelper.columnTemplates(templateId, columnId)
        const columnTasks = query(columnTasksRef, orderBy('createdAt', 'desc'));

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

        if (!normalizedTaskData.title) {
            throw new Error('Task title cannot be empty')
        }

        const newTaskRef = doc(pathHelper.columnTemplates(templateId, columnId))

        const operations = [
            {
                type: OPERATION_TYPES.SET,
                ref: newTaskRef,
                data: {
                    ...normalizedTaskData,
                    createdAt: Timestamp.now(),
                }
            }
        ]

        await batchOps(db, operations)
    },

    deleteTask: async (templateId, columnId, taskId) => {
        const taskRef = pathHelper.columnTemplate(templateId, columnId, taskId)

        const operations = [
            { type: OPERATION_TYPES.DELETE, ref: taskRef }
        ]

        await batchOps(db, operations)
    },

    updateTask: async (templateId, columnId, taskId, updates) => {
        const taskRef = pathHelper.columnTemplate(templateId, columnId, taskId)

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

            const columnTasksRef = pathHelper.columnTemplates(templateId, columnDoc.id)
            const columnTasksSnapshot = await getDocs(columnTasksRef)
            columnTasksSnapshot.forEach((taskDoc) => {
                operations.push({ type: OPERATION_TYPES.DELETE, ref: taskDoc.ref })
            })
        }

        return operations;
    }
}

