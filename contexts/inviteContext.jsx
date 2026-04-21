import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useUser } from '../hooks/useUser';

export const InviteContext = createContext(null);

export function InviteProvider({ children }) {
  const { user } = useUser()
  const [ invites, setInvites ] = useState([])
  const [ hasNewInvites, setHasNewInvites ] = useState([])

  // The use effect creates a listener on the background that updates upon invites query changes
  // Upon component (InviteProvider) deletion or user? change, for example logout, the listener is unsubscribed
  useEffect(() => {
    if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
      setInvites([]);
      return undefined;
    }

    const invitesQuery = query(
      collection(db, 'invites'),
      where('receiverId', '==', user.uid)
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
    );
    
    const existingSnapshot = await getDocs(existingInviteQuery);
    if (!existingSnapshot.empty) {
      throw new Error('Invite already sent to this user for this project');
    }

    await addDoc(collection(db, 'invites'), {
      ...inviteData,
      createdAt: new Date(),
    });
  }


  async function acceptInvite(id, projectId, receiverId) {
    await deleteDoc(doc(db, 'invites', id)); // delete the pending invite

    // add the project to the receiver's projects
    await addDoc(collection(db, 'projectMemberships'), {
            projectId: projectId,
            userId: receiverId
          })
  }

  async function ignoreInvite(id) {
    await deleteDoc(doc(db, 'invites', id)) // delete the pending invite
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
