import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { COLLECTIONS } from "../constants/Collections.js";

import { auth, db } from "../firebase/firebaseConfig.js";
import { pathHelper } from "./pathHelper.js";

GoogleSignin.configure({
  webClientId: "753470140358-bhafuk3b7q4hh4ut9fp111bm2du6ap5l.apps.googleusercontent.com",
});

async function getResponse() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  return await GoogleSignin.signIn();
}

export const authService = {
  subscribeAuthState: (onUpdate) => {
    return onAuthStateChanged(auth, (currentUser) => {
      onUpdate(currentUser);
    });
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
  },

  signInWithGoogle: async (onUpdate) => {
    const response = await getResponse();
    const idToken = response?.data?.idToken ?? response?.idToken;

    if (!idToken) {
      throw new Error("Failed to obtain ID token from Google Sign-In.");
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);

    const normalizedEmail = userCredential.user.email?.trim().toLowerCase() ?? "";

    // Before creating the user document, we ensure that the user is not an admin
    const isAdmin = await authService.isAdmin(userCredential.user);
    if (!isAdmin) {
        await setDoc(
        pathHelper.user(userCredential.user.uid),
        { email: normalizedEmail },
        { merge: true }
        );
    }

    onUpdate(userCredential.user);
    return userCredential.user;
  },

  signOut: async () => {
    try {
      await GoogleSignin.signOut();
    } catch (_) {}

    await firebaseSignOut(auth);
  },

  isAdmin: async (user) => {
    const userData = await getDoc(pathHelper.admin(user.uid));
    return !!userData.exists()
  }
};