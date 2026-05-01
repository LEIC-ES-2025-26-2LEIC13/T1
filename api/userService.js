import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { COLLECTIONS } from '../constants/Collections';

export const userService = {
  getUserByEmail: async (email) => {

    // limit(1) to save search computational effort and stop searching when a user is found (since email is unique)
    const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('email', '==', email),
        limit(1));

    // getDocs because we are not searching by exact document ID
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }
}
