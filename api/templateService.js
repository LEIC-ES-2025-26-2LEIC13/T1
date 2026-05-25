import { collection, doc, onSnapshot, query, writeBatch, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { batchOps, OPERATION_TYPES } from './batchOpsHelper';
import { COLLECTIONS } from "../constants/Collections";
import { pathHelper } from "./pathHelper";
import { templateColumnService } from "./templateColumnService";

// ...existing code...

function normalizeTemplateData({ title, description }) {
    return {
        title: title?.trim() ?? '',
        description: description?.trim() ?? '',
    }
}

function normalizeTemplateUpdates({ title, description }) {
    if (title !== undefined) {
        title = (title ?? '').trim();
        if (!title) throw new Error('Template title cannot be empty');
    }

    if (description !== undefined) {
        description = (description ?? '').trim();
    }

    return { title, description };
}

export const templateService = {
    // Subscribe to all templates (admin only)
    subscribeToAllTemplates: (onUpdate) => {
        const templatesCollection = query(collection(db, COLLECTIONS.TEMPLATES))

        return onSnapshot(templatesCollection, (templatesSnap) => {
            const templatesToDisplay = templatesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            onUpdate(templatesToDisplay)
        });
    },

    // Create a new template (admin only)
    createTemplate: async (templateData) => {
        const normalizedTemplateData = normalizeTemplateData(templateData)

        if (!normalizedTemplateData.title) {
            throw new Error("Please enter a template title")
        }

        const batch = writeBatch(db);

        const templateRef = doc(collection(db, COLLECTIONS.TEMPLATES));

        batch.set(templateRef, {
            ...normalizedTemplateData,
            columnCount: 0, // Initial column count is 0
        });

        await batch.commit();
    },

    // Update template
    updateTemplate: async (templateId, updates) => {
        const { title, description } = normalizeTemplateUpdates(updates)
        if (!title && !description) {
            return // no updates
        }

        const dataToUpdate = {}
        if (title !== undefined) dataToUpdate.title = title
        if (description !== undefined) dataToUpdate.description = description

        const operations = []

        // Update the main template document
        operations.push({
            type: OPERATION_TYPES.UPDATE,
            ref: doc(db, COLLECTIONS.TEMPLATES, templateId),
            data: dataToUpdate
        })

        await batchOps(db, operations)
    },

    // Delete template
    deleteTemplate: async (templateId) => {
        const operations = []

        // Get all columns and tasks to delete
        operations.push(...await templateColumnService.allColumnsRefsToDelete(templateId))

        // Delete the template document itself
        const mainTemplateRef = doc(db, COLLECTIONS.TEMPLATES, templateId)
        operations.push({ type: OPERATION_TYPES.DELETE, ref: mainTemplateRef })

        await batchOps(db, operations)
    },

    // Get a specific template
    getTemplate: async (templateId) => {
        const templateRef = pathHelper.template(templateId)
        const templateSnap = await getDoc(templateRef)

        if (!templateSnap.exists()) {
            return null
        }

        return {
            id: templateSnap.id,
            ...templateSnap.data()
        }
    },

    // Subscribe to a specific template's columns
    subscribeToTemplateColumns: (templateId, onUpdate) => {
        const templateColumnsRef = pathHelper.templateColumns(templateId)
        const columnsQuery = query(templateColumnsRef)

        return onSnapshot(columnsQuery, (columnsSnap) => {
            const columns = columnsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            onUpdate(columns)
        });
    },
}





