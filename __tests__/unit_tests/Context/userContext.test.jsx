import { UserContext, UserProvider } from "../../../contexts/userContext";
import { useUser } from "../../../hooks/useUser"
import { Text } from 'react-native'
import { render, screen, act } from '@testing-library/react-native'


// this has to be a descendent of UserProvider
const TestConsumer = ({ username, password }) => {
    // to obtain access to the data provided by the context
    const { user, isLoading, login } = useUser(UserContext)
    
    // return a "pressable" so that testing is possible (calling .onPress() function in the tests)
    return (
        <>
            <Text testID="user">{user}</Text>
            <Text testID="isLoading">{isLoading}</Text>
            <Text
                testID="login"
                onPress={() => login(username, password)}
            />
        </>
    )
}


// TestConsumer can now consume the context of UserContext
const testRender = (username, password) => {
    return render(
        <UserProvider>
            <TestConsumer username={username} password={password}/>
        </UserProvider>
    )
}

describe("UserContext", () => {

    test("Starts with null user and isLoading", () => {
        testRender("John Doe", "1234")
        
        expect(screen.getByTestId("user").props.children).toBeNull()
        expect(screen.getByTestId("isLoading").props.children).toBeNull()
    })


    test("Login with correct credentials", async () => {
        testRender("John Doe", "1234")

        // act is needed because there are state changes in the following function call and act forces the flush of those changes
        let sucess
        await act(async () => {
            success = await screen.getByTestId("login").props.onPress()
        })

        expect(success).toBe(true)
        expect(screen.getByTestId("user").props.children).toBe("John Doe")
        expect(screen.getByTestId("isLoading").props.children).toBe(false)
    })


    test("Login with wrong username", async () => {
        testRender("Mark Doe", "1234")

        let sucess
        await act(async () => {
            success = await screen.getByTestId("login").props.onPress()
        })

        expect(success).toBe(false)
        expect(screen.getByTestId("user").props.children).toBeNull()
        expect(screen.getByTestId("isLoading").props.children).toBe(false)
    })

    test("Login with wrong password", async () => {
        testRender("John Doe", "12345")
        
        let sucess
        await act(async () => {
            success = await screen.getByTestId("login").props.onPress()
        })

        expect(success).toBe(false)
        expect(screen.getByTestId("user").props.children).toBe(null)
        expect(screen.getByTestId("isLoading").props.children).toBe(false)
    })

    test("Login with wrong username and wrong password", async () => {
        testRender("Mark Doe", "12345")
        
        let sucess
        await act(async () => {
            success = await screen.getByTestId("login").props.onPress()
        })

        expect(success).toBe(false)
        expect(screen.getByTestId("user").props.children).toBe(null)
        expect(screen.getByTestId("isLoading").props.children).toBe(false)
    })
})