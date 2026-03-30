import { createContext, useState } from "react"

export const UserContext = createContext(null)

// only correct username-password pair, for now
const VALID_USERNAME = 'John Doe'
const VALID_PASSWORD = '1234'

export function UserProvider({ children }) { // children captures the content placed between opening and closing <UserProvider> tags
    const [user, setUser] = useState(null) // user will be null in the beginning (not authenticated, because null value is "falsy": see code in _layout.jsx)
    const [isLoading, setIsLoading] = useState(null)

    async function login(username, password) {
        setIsLoading(true) // for future API use (useful in loading / spinning buttons so that the user knows smth is happening)
        try {
            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                setUser(username)
                return true // successful login
            }
            return false // unsuccessful login

        } finally { // always happens
            setIsLoading(false)
        }
    }

    return (
        <UserContext.Provider value={{ user, isLoading, login }}>
            {children}
        </UserContext.Provider>
    )
}