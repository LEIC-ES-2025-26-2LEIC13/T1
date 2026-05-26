import { addDoc, deleteDoc, onSnapshot, query, Timestamp, orderBy, collection, getDocs } from "firebase/firestore";
import { pathHelper } from "./pathHelper";
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS } from '../constants/Collections';

function normalizeSuggestionData({ description, templateName }) {
    return {
        description: description?.trim() ?? '',
        templateName: templateName?.trim() ?? '',
    }
}

export const suggestionService = {
    createSuggestion: async (projectId, projectName, userId, userEmail, suggestionData) => {
        if (!userEmail || !suggestionData?.description) {
            throw new Error('User email and suggestion description are required');
        }

        const normalizedSuggestionData = normalizeSuggestionData(suggestionData);

        // Fetch all admins
        const adminsSnapshot = await getDocs(collection(db, COLLECTIONS.ADMIN));

        if (adminsSnapshot.empty) {
            console.warn('No admins found in database');
            return; // Allow suggestion to be submitted even if no admins exist
        }

        // Add suggestion to each admin's suggestions subcollection
        const suggestionPromises = adminsSnapshot.docs.map(adminDoc => {
            const adminId = adminDoc.id;
            return addDoc(pathHelper.adminSuggestions(adminId), {
                ...normalizedSuggestionData,
                userEmail: userEmail,
                createdAt: Timestamp.now(),
            });
        });

        await Promise.all(suggestionPromises);
    },

    // Optional: Add a function to fetch all suggestions (for the admin suggestions page)
    subscribeToAllSuggestions: (adminId, onUpdate) => {
        const suggestionsRef = query(
            pathHelper.adminSuggestions(adminId),
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

        // Fetch all admins
        const adminsSnapshot = await getDocs(collection(db, COLLECTIONS.ADMIN));

        // Delete suggestion from each admin's suggestions subcollection
        const deletePromises = adminsSnapshot.docs.map(adminDoc => {
            const adminId = adminDoc.id;
            return deleteDoc(pathHelper.adminSuggestion(adminId, suggestionId));
        });

        await Promise.all(deletePromises);
    }
}