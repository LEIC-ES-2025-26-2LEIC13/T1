import { useContext } from "react"
import { UserContext } from "../contexts/userContext"

export function useUser() { // custom hook, that can only be used in descendants of the UserProvider component
    const context = useContext(UserContext) // the variable context will be the object passed in the Provider's value prop (see userContext.jsx)

    if (!context) { // in case the above hook is used outside the UserProvider wrapper
        throw new Error("useUser must be used within a UserProvider")
    }

    return context
}
