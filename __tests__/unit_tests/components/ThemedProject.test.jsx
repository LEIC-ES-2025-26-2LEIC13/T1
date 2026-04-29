import { fireEvent, render, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors'
import ThemedCard from '../../../components/ThemedCard'
import { useRouter } from 'expo-router'
import ThemedProject from '../../../components/ThemedProject'

// useRouter and its push mock
const mockPush = jest.fn() // does nothing
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush })
}))

// useColorScheme mock
jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn()
    return actualModule
})

// ThemedText mock
jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native') // dynamically loads the react-native module
    return ({ children }) => <Text>{children}</Text>
})

describe("ThemedProject", () => {

    beforeEach(() => {
        jest.clearAllMocks() // clears mock calls before every test
        useColorScheme.mockReturnValue('light')
    })

    test("Applies light theme", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedProject testID="themed-project" />)

        const renderedProject = screen.getByTestId("themed-project")
        expect(renderedProject.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.navBackground })
            ])
        )
    })

    test("Applies dark theme", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedProject testID="themed-project" />)

        const renderedProject = screen.getByTestId("themed-project")
        expect(renderedProject.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.navBackground })
            ])
        )
    })

    test("Does not call router.push when pressed with no href specified", () => {
        render(<ThemedProject testID="themed-project"/>)
        
        fireEvent.press(screen.getByTestId("themed-project"))
        expect(mockPush).not.toHaveBeenCalled()
    })

    test("Calls router.push when pressed with href specified", () => {
        render(<ThemedProject testID="themed-project" href="project1"/>)
        
        fireEvent.press(screen.getByTestId("themed-project"))
        expect(mockPush).toHaveBeenCalledTimes(1)
    })
})
