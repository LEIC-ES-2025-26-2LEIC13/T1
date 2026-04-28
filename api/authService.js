import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"

import { auth } from "../firebase/firebaseConfig.js"


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
    },

    logout: async () =>  {
        await signOut(auth)
    }
}
