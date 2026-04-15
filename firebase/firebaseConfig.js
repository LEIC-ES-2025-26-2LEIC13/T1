import { initializeApp } from "firebase/app"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyChFY5K8ApRn1wtcsXwU3UeJBtV1rxZPrY",
    authDomain: "leico-53362.firebaseapp.com",
    projectId: "leico-53362",
    storageBucket: "leico-53362.firebasestorage.app",
    messagingSenderId: "753470140358",
    appId: "1:753470140358:web:763e865479c3164dd9ccc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

export const db = getFirestore(app);