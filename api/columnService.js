import { addDoc, getDocs, getCountFromServer, collection, doc, query, orderBy, onSnapshot, Timestamp, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/Collections";
import { batchDelete } from "./batchDeleteHelper";

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
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        // Query existing columns of that project, ordered by the order field
        const projectColumns = query(collection(projectRef, SUBCOLLECTIONS.PROJECT_COLUMNS), orderBy('order', 'asc'));

        return onSnapshot(projectColumns, (snapshot) => {
            const columnsToDisplay = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            onUpdate(columnsToDisplay);
        });
    },

    getColumnCount: async (projectId) => {
        if (!projectId) {
            throw new Error('Project ID is required to get column count')
        }
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
        const projectColumns = collection(projectRef, SUBCOLLECTIONS.PROJECT_COLUMNS) // Will contain all existing columns (id's of the project)

        // Get count from server allows to count the number of elements without fetching (avoids unecessary reads)
        const snapshot = await getCountFromServer(projectColumns)
        
        return snapshot.data().count
    },

    createColumn: async (projectId, columnData) => {
        if (!projectId) {
            throw new Error('Project ID is required to create a column')
        }
        // Normalize column name
        const normalizedColumnData = normalizeColumnData(columnData)
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
        // Will need a run transaction because the column count that is written in the end requires the previous existing value in the database
        let newColumnOrder;
        await runTransaction(db, async (transaction) => {
            const projectSnap = await transaction.get(projectRef)
            newColumnOrder = projectSnap.data().columnCount + 1 // Increase order of newly created column (considering the preexisting value)

            // Update the value of column count
            transaction.update(projectRef, { columnCount: newColumnOrder })
        })
        // After the transaction is successfully completed, we can add the new column to the projectColumns subcollection
        const projectColumnsRef = collection(projectRef, SUBCOLLECTIONS.PROJECT_COLUMNS)
        await addDoc(projectColumnsRef, {
            ...normalizedColumnData,
            order: newColumnOrder, // Order of the column is set considering the previous value of column count in the database (updated in the transaction)
            createdAt: Timestamp.now(),
        })
    },

    deleteColumn: async (projectId, columnId) => {
        // Delete column and tasks within that column
        const refsToDelete = []
        // Get all existing tasks
        const tasksRef = collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS)
        const tasksSnapshot = await getDocs(tasksRef)
        tasksSnapshot.forEach((doc) => {
            refsToDelete.push(doc.ref) // Add reference of each task to the list of references to delete
        })
        // Delete the column itself
        const columnRef = doc(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS, columnId)
        refsToDelete.push(columnRef)
        await batchDelete(db, refsToDelete) 
    },

    // Instead of calling deleteColumn for each column, we can get all references to be deleted and then provide them to the refsToDelete inside projectService
    allColumnsRefsToDelete: async(projectId) => {
        const refsToDelete = []
        
        const projectColumnsRef = collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS)
        const projectColumnsSnapshot = await getDocs(projectColumnsRef)

        // Must use forEach instead of map because getDocs is async 
        for (const columnDoc of projectColumnsSnapshot.docs) {
            const columnRef = columnDoc.ref
            refsToDelete.push(columnRef)

            const tasksRef = collection(columnRef, SUBCOLLECTIONS.COLUMN_TASKS)
            const tasksSnapshot = await getDocs(tasksRef)
            tasksSnapshot.forEach((taskDoc) => refsToDelete.push(taskDoc.ref))
        }

        return refsToDelete;
    },

    updateColumn: async (projectId, columnId, updates) => {
        const { name } = normalizeColumnUpdates(updates)
        if (!name) {
            return // no updates
        }

        const dataToUpdate = {}
        if (name !== undefined) dataToUpdate.name = name

        await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS, columnId), dataToUpdate)
    }
}

//TODO: Rever funções implementadas e criar UI para as mesmas. Testar interação e verificar no emulador
// Testar se um utilizador não autenticado consegue ainda aceder a partes internas do projeto