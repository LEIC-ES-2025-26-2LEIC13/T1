import { addDoc, deleteDoc, onSnapshot, query, Timestamp, orderBy } from "firebase/firestore";
import { pathHelper } from "./pathHelper";

function normalizeSuggestionData({ description, templateId, templateName }) {
    return {
        description: description?.trim() ?? '',
        templateId: templateId ?? '',
        templateName: templateName?.trim() ?? '',
    }
}

export const suggestionService = {
    createSuggestion: async (projectId, projectName, userId, userEmail, suggestionData) => {
        if (!projectId || !projectName || !userId || !userEmail || !suggestionData?.description) {
            throw new Error('Project ID, project name, user ID, user email and suggestion description are required');
        }

        const normalizedSuggestionData = normalizeSuggestionData(suggestionData);

        await addDoc(pathHelper.adminSuggestions(), {
            ...normalizedSuggestionData,
            projectId: projectId,
            projectName: projectName,
            userId: userId,
            userEmail: userEmail,
            createdAt: Timestamp.now(),
        });
    },

    // Optional: Add a function to fetch all suggestions (for the admin suggestions page)
    subscribeToAllSuggestions: (onUpdate) => {
        const suggestionsRef = query(
            pathHelper.adminSuggestions(),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(suggestionsRef, (snapshot) => {
            const suggestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            onUpdate(suggestions);
        });
    },

    deleteSuggestion: async (suggestionId) => {
        if (!suggestionId) {
            throw new Error('Suggestion ID is required to delete');
        }

        await deleteDoc(pathHelper.adminSuggestion(suggestionId));
    }
}