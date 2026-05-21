import { collection, doc, onSnapshot, query, getDocs, writeBatch, where } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { batchOps, OPERATION_TYPES } from './batchOpsHelper';
import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/Collections";
import { columnService } from "./columnService";
import { pathHelper } from "./pathHelper";

function normalizeProjectData({ title, description }) {
    return {
        title: title?.trim() ?? '',
        description: description?.trim() ?? '',
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
        const userProjectsCollection = pathHelper.userProjects(userId)
        // Gets projects in which the current user is envolved
        const userProjects = query(userProjectsCollection)
        
        return onSnapshot(userProjects, (userProjectsSnap) => {
            const projectsToDisplay = userProjectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            onUpdate(projectsToDisplay)
        });
    },

    createProject: async (userId, userEmail, projectData) => {
        const normalizedProjectData = normalizeProjectData(projectData)

        if (!normalizedProjectData.title) {
            throw new Error("Please enter a project title")
        }

        const batch = writeBatch(db); // creates a write batch

        const projectRef = doc(collection(db, COLLECTIONS.PROJECTS)); // Generates a new random id for a document that doesnt exist yet

        batch.set(projectRef, {
            ...normalizedProjectData,
            createdBy: userId,
            columnCount: 0, // Initial column count is 0 (used to track the order number of the next column)
        });

        // Create a document in a subcollection 'projectUsers' inside the respective project document
        const projectUserRef = doc(projectRef, SUBCOLLECTIONS.PROJECT_USERS, userId)
    
        // another write operation to perform at commit()
        batch.set(projectUserRef, {
            email: userEmail
        });

        // Create a document in a subcollection 'userProjects' inside the respective user document
        // The document ID is the same as the project ID to facilitate the project deletion later
        const userProjectRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_PROJECTS, projectRef.id)
        // another write operation to perform at commit()
        batch.set(userProjectRef, { 
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
        
        const operations = []

        // 1. Update the main project document
        operations.push({
            type: OPERATION_TYPES.UPDATE,
            ref: doc(db, COLLECTIONS.PROJECTS, projectId),
            data: dataToUpdate
        })

        // 2. Update all userProjects subcollection documents
        const projectUsersRef = pathHelper.projectUsers(projectId)
        const projectUsersSnapshot = await getDocs(projectUsersRef)

        projectUsersSnapshot.forEach((docSnap) => {
            const userId = docSnap.id
            const userProjectRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_PROJECTS, projectId)
            operations.push({
                type: OPERATION_TYPES.UPDATE,
                ref: userProjectRef,
                data: dataToUpdate
            })
        })

        await batchOps(db, operations)
    },

    deleteProject: async (projectId) => {
        // Array to hold the operations of every document we need to delete
        const operations = []

        // Add all data from columns and tasks within the project
        operations.push(...await columnService.allColumnsRefsToDelete(projectId))

        // Find all projectUsers inside the project to be deleted
        const projectUsersRef = pathHelper.projectUsers(projectId)
        const projectUsersSnapshot = await getDocs(projectUsersRef)

        // for each projectUsers doc    
        projectUsersSnapshot.forEach((docSnap) => {
            // Queue the subcollection document itself for deletion
            operations.push({ type: OPERATION_TYPES.DELETE, ref: docSnap.ref })
            // Remove that project from all users that reference it
            const userId = docSnap.id;
            const userProjectRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_PROJECTS, projectId)
            operations.push({ type: OPERATION_TYPES.DELETE, ref: userProjectRef })
        });

        // Add the deletion of the project doc itself
        const mainProjectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
        operations.push({ type: OPERATION_TYPES.DELETE, ref: mainProjectRef });

        // Execute the batch ops of all the collected operations
        await batchOps(db, operations);
    },

    getProjectUsers: async (projectId) => {
        const projectUsersRef = pathHelper.projectUsers(projectId)
        const projectUsersSnap = await getDocs(projectUsersRef)
        
        // Generate a new array of the fetched documents, with a new field id 
        return projectUsersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    },

    kickMember: async (projectId, userId) => {
        const operations = []

        // Remove the user from the project and the project from the user
        operations.push({ type: OPERATION_TYPES.DELETE, ref: pathHelper.userProject(userId, projectId) })
        operations.push({ type: OPERATION_TYPES.DELETE, ref: pathHelper.projectUser(projectId, userId) })
        
        // Remove the kicked member from the tasks he was assigned to in this specific project
        const userProjectTasksQuery = query(
            pathHelper.userTasks(userId),
            where('projectId', '==', projectId)
        )
        const userTasksSnap = await getDocs(userProjectTasksQuery)

        userTasksSnap.forEach((taskDoc) => {
            operations.push({ type: OPERATION_TYPES.DELETE, ref: taskDoc.ref }) // delete the task from the userTasks collection

             // Get the column task reference to update the assignedMembers field
            const columnTaskRef = pathHelper.columnTask(projectId, taskDoc.data().columnId, taskDoc.id)

            // update the assignedMembers field of the column task, removing the kicked member
            operations.push({
                type: OPERATION_TYPES.UPDATE,
                ref: columnTaskRef,
                data: {
                    assignedMembers: taskDoc.data().assignedMembers?.filter(member => member.id !== userId) || []
                }
            })
        })

        await batchOps(db, operations)
    },

    projectHasNoMembers: async (projectId) => {
        const projectUsersRef = pathHelper.projectUsers(projectId)
        const projectUsersSnap = await getDocs(projectUsersRef)
        return projectUsersSnap.empty
    }
}