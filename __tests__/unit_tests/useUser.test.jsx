import { renderHook } from "@testing-library/react-native"
import { UserProvider } from "../../contexts/userContext"
import { useAuth } from "../../hooks/useAuth"

describe("useAuth", () => {

    test("Get context values", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: UserProvider })

        // verifies if the 3 context values exist
        expect(result.current.user).toBeNull()
        expect(result.current.isLoading).toBeNull()
        expect(typeof result.current.login).toBe('function')
    })

    test("Hook used outside UserProvider", () => {
        expect(() => {
            renderHook(() => useAuth())
        }).toThrow("useAuth must be used within a UserProvider")
    })
})