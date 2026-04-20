import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useUser } from '../hooks/useUser';

export const InviteContext = createContext(null);

export function InviteProvider({ children }) {
  const { user } = useUser();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      setInvites([]);
      return undefined;
    }

    const invitesQuery = query(
      collection(db, 'invites'),
      where('receiverId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
      setInvites(snapshot.docs.map((inviteDoc) => ({ id: inviteDoc.id, ...inviteDoc.data() })));
    });

    return unsubscribe;
  }, [user?.uid]);

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

  async function acceptInvite(inviteId) {
    await deleteDoc(doc(db, 'invites', inviteId));
  }

  const value = useMemo(() => ({
    invites,
    sendInvite,
    acceptInvite,
  }), [invites]);

  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  );
}