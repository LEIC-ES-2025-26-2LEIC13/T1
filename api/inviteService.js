import { addDoc, deleteDoc, getDocs, getDoc, onSnapshot, query, Timestamp, where, runTransaction } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { pathHelper } from "./pathHelper";

export const inviteService = {
    subscribeToUserInvites: (userId, onUpdate) => {
        const invitesQuery = query(pathHelper.userInvites(userId));
    
        return onSnapshot(invitesQuery, (snapshot) => {
            const fetchedInvites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            onUpdate(fetchedInvites);
        });
    },


    sendInvite: async ({ senderId, senderEmail, receiverId, projectId, projectName }) => {
        // Checking if an invite was already sent to that user
        const existingInviteQuery = query(
            pathHelper.userInvites(receiverId),
            where('projectId', '==', projectId)
        )

        const existingSnapshot = await getDocs(existingInviteQuery)
        if (!existingSnapshot.empty) {
            throw new Error('Invite already sent to this user for this project')
        }

        // Checking if the user is already in that project
        const projectUserRef = pathHelper.projectUser(projectId, receiverId)
        
        const projectUserSnap = await getDoc(projectUserRef)
        if (projectUserSnap.exists()) {
            throw new Error('This user is already in this project')
        }
    
        // Add a document to the userInvites subcollection
        await addDoc(pathHelper.userInvites(receiverId), {
            senderId: senderId,
            senderEmail: senderEmail,
            projectId: projectId,
            projectName: projectName,
            createdAt: Timestamp.now(),
        })
    },


    acceptInvite: async (userId, userEmail, { id, projectId }) => {
        // Just references / paths to documents, not actual documents
        const projectRef = pathHelper.project(projectId) // respective document of the project in the projects collection

        // Executes atomically (all operations succeed or all operations fail)
        await runTransaction(db, async (transaction) => {

            // Refers to the pending invite
            const inviteRef = pathHelper.userInvite(userId, id)

            // Actual document (snapshot of it) within the transaction
            // Reads must happen before writes in transactions
            const projectSnap = await transaction.get(projectRef)

            if (!projectSnap.exists()) {
                transaction.delete(inviteRef) // delete the pending invite upon error
                throw new Error('This project no longer exists. Project may have been deleted after the invite was sent.')
            }

            // Get their data as an object
            const { title, description } = projectSnap.data()

            // Compute next order for the user's project list
            const userProjectsSnapshot = await getDocs(pathHelper.userProjects(userId))
            const nextOrder = userProjectsSnapshot.docs.length

            // Upon invite of a new user for the specified project by projectId, the same id as the global collection, that value must be enforced proper deletion
            const newUserProjectRef = pathHelper.userProject(userId, projectId)
            const newProjectUserRef = pathHelper.projectUser(projectId, userId)
            
            // Writes after reads:

            transaction.delete(inviteRef) // delete the pending invite in the user's invites

            // Creates a document for one more project inside the 'userProjects' subcollection inside receiver document
            // transaction.set() creates a document if it does not exist
            transaction.set(newUserProjectRef, {
                title: title,
                description: description,
                order: nextOrder
            })

            // Creates a document for one more user (email only) inside the 'projectUsers' subcollection inside project document
            transaction.set(newProjectUserRef, {
                email: userEmail
            })
        })
    },


    ignoreInvite: async (userId, inviteId)  => {
        // alternating collection/document path sequence
        await deleteDoc(pathHelper.userInvite(userId, inviteId));
    }
}
