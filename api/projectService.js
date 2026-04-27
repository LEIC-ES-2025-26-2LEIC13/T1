import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc } from "firebase/firestore";
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

        const projectRef = await addDoc(collection(db, 'projects'), {
            ...normalizedProjectData,
            createdBy: userId
        });

        // Create a document in a subcolletion 'projectUsers' inside the respective project document
        await addDoc(collection(projectRef, 'projectUsers'), {
            userId: userId,
            email: userEmail
        });

        const userRef = doc(db, 'users', userId)

        // Create a document in a subcolletion 'userProjects' inside the respective user document
        await addDoc(collection(userRef, 'userProjects'), { 
            projectId: projectRef.id,
            title: normalizedProjectData.title,
            description: normalizedProjectData.description
        });
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
    },

    getProjectUsers: async (projectId) => {
        const projectUsersRef = collection(db, 'projects', projectId, 'projectUsers')
        const projectUsersSnap = await getDocs(projectUsersRef)
        
        // Generate a new array of the fetched documents, with a new field id 
        return projectUsersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    }
};
