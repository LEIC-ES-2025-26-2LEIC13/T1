import { renderHook } from "@testing-library/react-native"
import { UserProvider } from "../../contexts/userContext"
import { useUser } from "../../hooks/useUser"

describe("useUser", () => {

    test("Get context values", () => {
        const { result } = renderHook(() => useUser(), { wrapper: UserProvider })

        // verifies if the 3 context values exist
        expect(result.current.user).toBeNull()
        expect(result.current.isLoading).toBeNull()
        expect(typeof result.current.login).toBe('function')
    })

    test("Hook used outside UserProvider", () => {
        expect(() => {
            renderHook(() => useUser())
        }).toThrow("useUser must be used within a UserProvider")
    })
})