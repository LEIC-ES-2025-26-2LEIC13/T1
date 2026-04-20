import { createContext, useMemo } from 'react';
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  async function getUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return null;
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', normalizedEmail),
      limit(1)
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  const value = useMemo(() => ({
    getUserByEmail,
  }), []);

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}