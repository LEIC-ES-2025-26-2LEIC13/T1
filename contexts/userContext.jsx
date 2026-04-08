import { createContext, useState, useEffect, useMemo } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig"

export const UserContext = createContext(null)

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Listen to auth state changes on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setIsLoading(false)
        })
        return () => unsubscribe()
    }, [])

    async function login(email, password) {
        setIsLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            setUser(userCredential.user)
            return true

        } catch (error) {
            console.error("Login error:", error.code, error.message)
            throw error // Pass the error up so the component can handle it

        } finally {
            setIsLoading(false)
        }
    }

    async function register(email, password) {
        setIsLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            setUser(userCredential.user)
            return true

        } catch (error) {
            console.error("Register error:", error.code, error.message)
            throw error // Pass the error up so the component can handle it

        } finally {
            setIsLoading(false)
        }
    }

    async function logout() {
        setIsLoading(true)
        try {
            await signOut(auth)
            setUser(null)
            return true

        } catch (error) {
            console.error("Logout error:", error.message)
            return false

        } finally {
            setIsLoading(false)
        }
    }

    const value = useMemo(() => ({
        user,
        isLoading,
        login,
        register,
        logout
    }), [user, isLoading])

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}