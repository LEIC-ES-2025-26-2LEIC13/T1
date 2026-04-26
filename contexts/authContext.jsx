import { createContext, useState, useEffect, useMemo } from "react"
import { authService } from "../api/authService"

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
            return true
        } catch (error) {
            console.error("Login error:", error.message)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    async function register(email, password) {
        setIsLoading(true)
        try {
            await authService.register(email, password, setUser)
            return true
        } catch (error) {
            console.error("Register error:", error.code, error.message)
            throw error
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
