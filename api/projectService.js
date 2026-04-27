import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, writeBatch } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

function normalizeProjectData({ title, description }) {
    return {
        title: title?.trim() ?? '',
        description: description?.trim() ?? '',
    }
}

function validateProjectTitle({ title }) {
    if (!title) {
        throw new Error('Please enter a project title')
    }
}

function normalizeProjectUpdates( { title, description }) {
    if (title !== undefined) {
        title = (title ?? '').trim();
        if (!title) throw new Error('Project title cannot be empty');
    }

    if (description !== undefined) {
        description = (description ?? '').trim();
    }

    return { title, description };
}

export const projectService = {
    subscribeToUserProjects: (userId, onUpdate) => {
        const userRef = doc(db, 'users', userId)
        // Gets projects in which the current user is envolved
        const userProjects = query(collection(userRef, 'userProjects'))

        return onSnapshot(userProjects, (userProjectsSnap) => {
            const projectsToDisplay = userProjectsSnap.docs.map(doc => ({
                id: doc.data().projectId, // true project ID 
                ...doc.data(),
            }));
            
            onUpdate(projectsToDisplay)
        });
    },

    createProject: async (userId, userEmail, projectData) => {
        const normalizedProjectData = normalizeProjectData(projectData)
        validateProjectTitle(normalizedProjectData)

        const batch = writeBatch(db); // creates a write batch

        const projectRef = doc(collection(db, 'projects'));
        // a write operation to perform at commit() 
        batch.set(projectRef, {
            ...normalizedProjectData,
            createdBy: userId
        });

        // Create a document in a subcollection 'projectUsers' inside the respective project document
        const projectUserRef = doc(collection(projectRef, 'projectUsers'));
        // another write operation to perform at commit()
        batch.set(projectUserRef, {
            userId: userId,
            email: userEmail
        });

        const userRef = doc(db, 'users', userId)

        // Create a document in a subcollection 'userProjects' inside the respective user document
        const userProjectRef = doc(collection(userRef, 'userProjects'));
        // another write operation to perform at commit()
        batch.set(userProjectRef, { 
            projectId: projectRef.id,
            title: normalizedProjectData.title,
            description: normalizedProjectData.description
        });

        await batch.commit(); // Ccommits all of the writes in this write batch as a single atomic unit
    },

    updateProject: async (projectId, updates) => {
        const { title, description } = normalizeProjectUpdates(updates)
        if (!title && !description) {
            return // no updates
        }

        const dataToUpdate = {}
        if (title !== undefined) dataToUpdate.title = title
        if (description !== undefined) dataToUpdate.description = description
        
        await updateDoc(doc(db, 'projects', projectId), dataToUpdate)
    },

    deleteProject: async (projectId) => {
        await deleteDoc(doc(db, 'projects', projectId))
    }
};
