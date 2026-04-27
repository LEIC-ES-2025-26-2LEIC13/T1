import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, getDocs, writeBatch } from "firebase/firestore";

import { db } from '../firebase/firebaseConfig';
import { batchDelete } from './batchDeleteHelper';

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

        const projectRef = doc(collection(db, 'projects')); // Generates a new random id for a document that doesnt exist yet

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
        // The document ID is the same as the project ID to facilitate the project deletion later
        const userProjectRef = doc(db, 'users', userId, 'userProjects', projectRef.id)
        // another write operation to perform at commit()
        batch.set(userProjectRef, { 
            projectId: projectRef.id,
            title: normalizedProjectData.title,
            description: normalizedProjectData.description
        })

        await batch.commit(); // Commits all of the writes in this write batch as a single atomic unit
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
        // Array to hold the references of every document we need to delete
        const refsToDelete = []
        
        // Find all tasks inside that project and adds them to the references to delete
        const tasksRef = collection(db, 'projects', projectId, 'projectTasks')
        const tasksSnapshot = await getDocs(tasksRef)

        tasksSnapshot.forEach((docSnap) => {
            refsToDelete.push(docSnap.ref)
        });

        // Find all projectUsers inside the project to be deleted
        const projectUsersRef = collection(db, 'projects', projectId, 'projectUsers')
        const projectUsersSnapshot = await getDocs(projectUsersRef)

        // for each projectUsers doc
        projectUsersSnapshot.forEach((docSnap) => {
            // Queue the subcollection document itself for deletion
            refsToDelete.push(docSnap.ref)
            // Remove that project from all users that reference it
            const userId = docSnap.data().userId;
            const userProjectRef = doc(db, 'users', userId, 'userProjects', projectId)
            refsToDelete.push(userProjectRef)
        });

        // Add the deletion of the project doc itself
        const mainProjectRef = doc(db, 'projects', projectId)
        refsToDelete.push(mainProjectRef);

        // Execute the batch deletion of all the collected references
        await batchDelete(db, refsToDelete);
    }
}