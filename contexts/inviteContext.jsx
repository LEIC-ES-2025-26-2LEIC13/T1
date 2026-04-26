import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useUser } from '../hooks/useUser';

export const InviteContext = createContext(null);

export function InviteProvider({ children }) {
	const { user } = useUser()
	const [ invites, setInvites ] = useState([])
	const [ hasNewInvites, setHasNewInvites ] = useState(false)

	// The use effect creates a listener on the background that updates upon invites query changes
	// Upon component (InviteProvider) deletion or user? change, for example logout, the listener is unsubscribed
	useEffect(() => {
		if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
			setInvites([]);
			return undefined;
		}

		const userRef = doc(db, 'users', user.uid)
		const invitesQuery = query(
			collection(userRef, 'userInvites')
		);

		const unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
			setHasNewInvites(snapshot.docs.length > invites.length) // new invites
			
			setInvites(snapshot.docs.map((inviteDoc) => ({ id: inviteDoc.id, ...inviteDoc.data() })));
		});

		return unsubscribe; // unsubscribe returned by onSnapshot
	}, [user?.uid]); // cannot add invites.length as a dependency, otherwise the callback will be triggered twice


	async function sendInvite({ senderId, senderEmail, receiverId, projectId, projectName }) {
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
			collection(projectRef, 'users'),
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
			createdAt: new Date(),
		})
  	}


	// id <=> inviteId
	async function acceptInvite({ id, projectId }) {
		// Just references / paths to documents, not actual documents
		const receiverRef = doc(db, 'users',  user.uid) // respective document of the user in the users collection
		const projectRef = doc(db, 'projects', projectId) // respective document of the project in the projects collection

		// Actual documents (snapshots of them)
		const projectSnap = await getDoc(projectRef)

		if (!projectSnap.exists()) {
			throw new Error('This project no longer exists. Project may have been deleted after the invite was sent.')
		}

		// Get their data as an object
		const { title, description } = projectSnap.data()

		await deleteDoc(doc(receiverRef, 'userInvites', id)) // delete the pending invite in the user's invites

		// Creates a document for one more project inside the 'projects' subcollection inside receiver document
		await addDoc(collection(receiverRef, 'projects'), {
				projectId, // or projectSnap.id
				title,
				description
			})

		// Creates a document for one more user (email only) inside the 'users' subcollection inside project document
		await addDoc(collection(projectRef, 'users'), {
				userId: user.uid,
				email: user.email
			})
  }

  async function ignoreInvite({ id }) {
		const receiverRef = doc(db, 'users', user.uid) // respective document of the user in the users collection

		await deleteDoc(doc(receiverRef, 'userInvites', id)) // delete the pending invite in the user's invites
  }

  const value = useMemo(() => ({
    invites,
    hasNewInvites,
    setHasNewInvites,
    sendInvite,
    acceptInvite,
    ignoreInvite
  }), [invites, hasNewInvites]);

  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  );
}
