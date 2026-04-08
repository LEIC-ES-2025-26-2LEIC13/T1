import { initializeApp } from "firebase/app"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"

const firebaseConfig = {
    apiKey: "AIzaSyA15meIH1cbXBgXra7sJEuyc5-phqyfEM8",
    authDomain: "leico-test.firebaseapp.com",
    projectId: "leico-test",
    storageBucket: "leico-test.firebasestorage.app",
    messagingSenderId: "891799791867",
    appId: "1:891799791867:web:ca69803e0a8602aee3a85e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})