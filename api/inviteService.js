import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';


export const inviteService = {
    subscribeToUserInvites: (userId, onUpdate) => {
        const userRef = doc(db, 'users', userId);
        const invitesQuery = query(collection(userRef, 'userInvites'));
    
        return onSnapshot(invitesQuery, (snapshot) => {
            const fetchedInvites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            onUpdate(fetchedInvites);
        });
    },


    sendInvite: async ({ senderId, senderEmail, receiverId, projectId, projectName }) => {
        const receiverRef = doc(db, 'users', receiverId)

        // Checking if an invite was already sent to that user
        const existingInviteQuery = query(
            collection(receiverRef, 'userInvites'),
            where('projectId', '==', projectId)
        )

        const existingSnapshot = await getDocs(existingInviteQuery)
        if (!existingSnapshot.empty) {
            throw new Error('Invite already sent to this user for this project')
        }

        // Checking if the user is already in that project
        const projectRef = doc(db, 'projects', projectId)
        const userAlreadyInProjectQuery = query(
            collection(projectRef, 'projectUsers'),
            where('userId', '==', receiverId)
        )
        
        const inProjectSnapshot = await getDocs(userAlreadyInProjectQuery)
        if (!inProjectSnapshot.empty) {
            throw new Error('This user is already in this project')
        }
    
        // Add a document to the userInvites subcollection
        await addDoc(collection(receiverRef, 'userInvites'), {
            senderId: senderId,
            senderEmail: senderEmail,
            projectId: projectId,
            projectName: projectName,
            createdAt: Timestamp.now(),
        })
    },


    acceptInvite: async (userId, userEmail, { id, projectId }) => {
        // Just references / paths to documents, not actual documents
        const receiverRef = doc(db, 'users',  userId) // respective document of the user in the users collection
        const projectRef = doc(db, 'projects', projectId) // respective document of the project in the projects collection

        // Actual documents (snapshots of them)
        const projectSnap = await getDoc(projectRef)

        if (!projectSnap.exists()) {
            throw new Error('This project no longer exists. Project may have been deleted after the invite was sent.')
        }

        // Get their data as an object
        const { title, description } = projectSnap.data()

        await deleteDoc(doc(receiverRef, 'userInvites', id)) // delete the pending invite in the user's invites

        // Creates a document for one more project inside the 'userProjects' subcollection inside receiver document
        await addDoc(collection(receiverRef, 'userProjects'), {
                projectId, // or projectSnap.id
                title,
                description
            })

        // Creates a document for one more user (email only) inside the 'projectUsers' subcollection inside project document
        await addDoc(collection(projectRef, 'projectUsers'), {
                userId: userId,
                email: userEmail
            })
    },


    ignoreInvite: async (userId, inviteId)  => {
        // alternating collection/document path sequence
        await deleteDoc(doc(db, 'users', userId, 'userInvites', inviteId));
    }
}
