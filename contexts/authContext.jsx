import { createContext, useState, useEffect, useMemo } from "react"
import { authService } from "../api/authService"
import { Alert } from "react-native"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Keep user logged in
    useEffect(() => {
        setIsLoading(true)

        
        const unsub = authService.subscribeAuthState((currentUser) => {
            setUser(currentUser)
            setIsLoading(false)
        })

        return unsub
    }, [])

    async function login(email, password) {
        setIsLoading(true)
        try {
            await authService.login(email, password, setUser)
        } catch (error) {
            let errorMessage

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "The email address is invalid."
                    break
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled."
                    break
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email. Please register first."
                    break
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Incorrect email or password. Please try again."
                    break
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed login attempts. Please try again later."
                    break
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection."
                    break
                default:
                    errorMessage = error.message
            }

            Alert.alert("Login Error", errorMessage)

        } finally {
            setIsLoading(false)
        }
    }

    async function register(email, password) {
        setIsLoading(true)
        try {
            await authService.register(email, password, setUser)
            Alert.alert("Success", "Account created successfully!")

        } catch (error) {
            let errorMessage = error.message
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please use a different email or login instead."
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address is invalid. Please check and try again."
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "The password is too weak. Please use at least 6 characters."
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "Account creation is currently disabled. Please try again later."
            }
            Alert.alert("Registration Error", errorMessage)

        } finally {
            setIsLoading(false)
        }
    }

    async function logout() {
        setIsLoading(true)
        try {
            authService.logout()
            return true
        } catch (error) {
            console.error("Logout error:", error.message)
            throw error
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
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
