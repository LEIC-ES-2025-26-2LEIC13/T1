import { useContext } from "react"
import { AuthContext } from "../contexts/authContext"

export function useAuth() { // custom hook, that can only be used in descendants of the UserProvider component
    const context = useContext(AuthContext) // the variable context will be the object passed in the Provider's value prop (see userContext.jsx)

    if (!context) { // in case the above hook is used outside the UserProvider wrapper
        throw new Error("useAuth must be used within a UserProvider")
    }

    return context
}
