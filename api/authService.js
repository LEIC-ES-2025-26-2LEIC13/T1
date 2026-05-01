import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig.js"
import { COLLECTIONS } from "../constants/Collections.js"

export const authService = {
    subscribeAuthState: (onUpdate) => {
        return onAuthStateChanged(auth, (currentUser) => {
            onUpdate(currentUser)
        })
    },

    login: async (email, password, onUpdate) => {
         const userCredential = await signInWithEmailAndPassword(auth, email, password) 
         onUpdate(userCredential.user)
    },

    register: async (email, password, onUpdate) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password) 
        onUpdate(userCredential.user)

        // Add the new user to the users collection
        if (auth.currentUser) {
            const normalizedEmail = email.trim().toLowerCase()
            await setDoc(doc(db, COLLECTIONS.USERS, auth.currentUser.uid), {
                email: normalizedEmail,
            })
        }
    },

    logout: async () =>  {
        await signOut(auth)
    }
}
