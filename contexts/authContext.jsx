import { createContext, useState, useEffect, useMemo, useCallback } from "react"
import { authService } from "../api/authService"
import ThemedAlert, { ALERT_TYPES } from "../components/ThemedAlert"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const [alertVisible, setAlertVisible] = useState(false)
    const [alert, setAlert] = useState({ title: '', message: '', type: ALERT_TYPES.ERROR })


    const showAlert = useCallback((type, title, message) => {
        setAlert({ type, title, message })
        setAlertVisible(true)
    }, [])

    const closeAlert = () => setAlertVisible(false)

    // Keep user logged in
    useEffect(() => {
        setIsLoading(true)

        
        const unsub = authService.subscribeAuthState((currentUser) => {
            setUser(currentUser)
            setIsLoading(false)
        })

        return unsub
    }, [])

    const login = useCallback(async (email, password) => {
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

            showAlert(ALERT_TYPES.ERROR, "Login Error", errorMessage)

        } finally {
            setIsLoading(false)
        }
    }, [showAlert])

    const register = useCallback(async (email, password) => {
        setIsLoading(true)
        try {
            await authService.register(email, password, setUser)
            showAlert(ALERT_TYPES.SUCCESS, "Success", "Account created successfully!")

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
            showAlert(ALERT_TYPES.ERROR, "Registration Error", errorMessage)

        } finally {
            setIsLoading(false)
        }
    }, [showAlert])

    const logout = useCallback(async () => {
        setIsLoading(true)
        try {
            authService.logout()
            return true
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Logout Error", error.message)
        } finally {
            setIsLoading(false)
        }
    }, [showAlert])

    const value = useMemo(() => ({
        user,
        isLoading,
        login,
        register,
        logout
    }), [user, isLoading, login, register, logout])

    return (
        <AuthContext.Provider value={value}>
            {children}
            <ThemedAlert 
                visible={alertVisible} 
                alert={alert} 
                onConfirm={closeAlert} 
            />
        </AuthContext.Provider>
    )
}
