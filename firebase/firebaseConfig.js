// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChFY5K8ApRn1wtcsXwU3UeJBtV1rxZPrY",
    authDomain: "leico-53362.firebaseapp.com",
    projectId: "leico-53362",
    storageBucket: "leico-53362.firebasestorage.app",
    messagingSenderId: "753470140358",
    appId: "1:753470140358:web:763e865479c3164dd9ccc7"
};

// Initialize Firebase
let app;
let auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Failed to initialize Firebase:", error.code, error.message);
}

export { auth };
export default app;
