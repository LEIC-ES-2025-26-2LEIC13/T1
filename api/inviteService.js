import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, Timestamp, where, runTransaction } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS, SUBCOLLECTIONS } from '../constants/Colletions';

export const inviteService = {
    subscribeToUserInvites: (userId, onUpdate) => {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const invitesQuery = query(collection(userRef, SUBCOLLECTIONS.USER_INVITES));
    
        return onSnapshot(invitesQuery, (snapshot) => {
            const fetchedInvites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            onUpdate(fetchedInvites);
        });
    },


    sendInvite: async ({ senderId, senderEmail, receiverId, projectId, projectName }) => {
        const receiverRef = doc(db, COLLECTIONS.USERS, receiverId)

        // Checking if an invite was already sent to that user
        const existingInviteQuery = query(
            collection(receiverRef, SUBCOLLECTIONS.USER_INVITES),
            where('projectId', '==', projectId)
        )

        const existingSnapshot = await getDocs(existingInviteQuery)
        if (!existingSnapshot.empty) {
            throw new Error('Invite already sent to this user for this project')
        }

        // Checking if the user is already in that project
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)
        const userAlreadyInProjectQuery = query(
            collection(projectRef, SUBCOLLECTIONS.PROJECT_USERS),
            where('userId', '==', receiverId)
        )
        
        const inProjectSnapshot = await getDocs(userAlreadyInProjectQuery)
        if (!inProjectSnapshot.empty) {
            throw new Error('This user is already in this project')
        }
    
        // Add a document to the userInvites subcollection
        await addDoc(collection(receiverRef, SUBCOLLECTIONS.USER_INVITES), {
            senderId: senderId,
            senderEmail: senderEmail,
            projectId: projectId,
            projectName: projectName,
            createdAt: Timestamp.now(),
        })
    },


    acceptInvite: async (userId, userEmail, { id, projectId }) => {
        // Just references / paths to documents, not actual documents
        const receiverRef = doc(db, COLLECTIONS.USERS,  userId) // respective document of the user in the users collection
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId) // respective document of the project in the projects collection

        // Executes atomically (all operations succeed or all operations fail)
        await runTransaction(db, async (transaction) => {
            // Actual document (snapshot of it) within the transaction
            // Reads must happen before writes in transactions
            const projectSnap = await transaction.get(projectRef)

            if (!projectSnap.exists()) {
                throw new Error('This project no longer exists. Project may have been deleted after the invite was sent.')
            }

            // Get their data as an object
            const { title, description } = projectSnap.data()

            // The following doc() function calls only generate a new random ID for a document that doesn't exist yet
            const inviteRef = doc(receiverRef, SUBCOLLECTIONS.USER_INVITES, id)
            // Upon invite of a new user for the specified project by projectId, the same id as the global collection, that value must be enforced proper deletion
            const newUserProjectRef = doc(receiverRef, SUBCOLLECTIONS.USER_PROJECTS, projectId)
            const newProjectUserRef = doc(collection(projectRef, SUBCOLLECTIONS.PROJECT_USERS))

            transaction.delete(inviteRef) // delete the pending invite in the user's invites

            // Creates a document for one more project inside the 'userProjects' subcollection inside receiver document
            // transaction.set() creates a document if it does not exist
            transaction.set(newUserProjectRef, {
                projectId: projectId, // or projectSnap.id
                title: title,
                description: description
            })

            // Creates a document for one more user (email only) inside the 'projectUsers' subcollection inside project document
            transaction.set(newProjectUserRef, {
                userId: userId,
                email: userEmail
            })
        })
    },


    ignoreInvite: async (userId, inviteId)  => {
        // alternating collection/document path sequence
        await deleteDoc(doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_INVITES, inviteId));
    }
}
