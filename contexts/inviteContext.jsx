import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../hooks/useAuth';

export const InviteContext = createContext(null);

export function InviteProvider({ children }) {
	const { user } = useAuth()
	const [ invites, setInvites ] = useState([])
	const [ hasNewInvites, setHasNewInvites ] = useState([])

	// The use effect creates a listener on the background that updates upon invites query changes
	// Upon component (InviteProvider) deletion or user? change, for example logout, the listener is unsubscribed
	useEffect(() => {
		if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
			setInvites([]);
			return undefined;
		}

		const userRef = doc(db, 'users', user.uid)
		const invitesQuery = query(
			collection(userRef, 'invites')
		);

		const unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
			setHasNewInvites(snapshot.docs.length > invites.length) // new invites
			
			setInvites(snapshot.docs.map((inviteDoc) => ({ id: inviteDoc.id, ...inviteDoc.data() })));
		});

		return unsubscribe; // unsubscribe returned by onSnapshot
	}, [user?.uid]); // cannot add invites.length as a dependency, otherwise the callback will be triggered twice


	async function sendInvite(inviteData) {
		// Check if invite already exists for this receiverId/projectId combo
		const existingInviteQuery = query(
			collection(db, 'invites'),
			where('receiverId', '==', inviteData.receiverId),
			where('projectId', '==', inviteData.projectId)
		)

		const projectRef = doc(db, 'projects', inviteData.projectId)
		const userAlreadyInProjectQuery = query(
			collection(projectRef, 'users'),
			where('userId', '==', inviteData.receiverId)
		)
		
		// Checking if an invite was already sent to that user
		const existingSnapshot = await getDocs(existingInviteQuery)
		if (!existingSnapshot.empty) {
			throw new Error('Invite already sent to this user for this project')
		}

		// Checking if the user is already in that project
		const inProjectSnapshot = await getDocs(userAlreadyInProjectQuery)
		if (!inProjectSnapshot.empty) {
			throw new Error('This user is already in this project')
		}

		const receiverRef = doc(db, 'users', inviteData.receiverId)

		// Create a reference for the global invite to generate a unique ID (doc() without a 2nd argument generates a new unique ID and does not write anything yet)
		const globalInviteRef = doc(collection(db, 'invites'))
		const inviteObject = { // do not store receiverId (it is the id of the current user)
			senderId: inviteData.senderId,
			senderEmail: inviteData.senderEmail,
			receiverId: inviteData.receiverId,
			projectId: inviteData.projectId,
			projectName: inviteData.projectName,
			createdAt: new Date(),
		}

		// Add document to the (global) collection 'invites'
		await setDoc(globalInviteRef, inviteObject)

		// Add document to the subcollection 'invites' of the receiver document using the SAME ID
		await setDoc(doc(receiverRef, 'invites', globalInviteRef.id), inviteObject)
  	}


	async function acceptInvite(invite) {
		// Just references / paths to documents, not actual documents
		const receiverRef = doc(db, 'users',  user.uid) // respective document of the user in the users collection
		const projectRef = doc(db, 'projects', invite.projectId) // respective document of the project in the projects collection

		// Actual documents (snapshots of them)
		const projectSnap = await getDoc(projectRef)

		// Get their data as an object
		const projectData = projectSnap.data()

		await deleteDoc(doc(db, 'invites', invite.id)) // delete the pending invite globally
		await deleteDoc(doc(receiverRef, 'invites', invite.id)) // delete the pending invite in the user's invites

		// Creates a document for one more project inside the 'projects' subcollection inside receiver document
		await addDoc(collection(receiverRef, 'projects'), {
				projectId: projectSnap.id, // id is obtained from the snapshot
				title: projectData.title,
				description: projectData.description
			})

		// Creates a document for one more user (email only) inside the 'users' subcollection inside project document
		await addDoc(collection(projectRef, 'users'), {
				userId: user.uid,
				email: user.email
			})
  }

  async function ignoreInvite(invite) {
		const receiverRef = doc(db, 'users', user.uid) // respective document of the user in the users collection

		await deleteDoc(doc(db, 'invites', invite.id)) // delete the pending invite globally
		await deleteDoc(doc(receiverRef, 'invites', invite.id)) // delete the pending invite in the user's invites
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
