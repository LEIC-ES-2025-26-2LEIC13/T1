import { render, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import ThemedView from '../components/ThemedView'
import { Colors } from '../constants/Colors'

// every time the module 'react-native' is imported in tests, the mock implementation will be used instead of the actual module
jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn() // creates a spy function to replace the original useColorScheme hook
    return actualModule
})

// describe is a Jest function that groups related tests together. It takes a string description and a callback function containing the tests.
describe("ThemedView", () => {
    test("Applies light theme", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedView testID="themed-view" />) // the prop gets captured by ...props

        const renderedView = screen.getByTestId("themed-view")
        expect(renderedView.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.background })
            ])
        )
    })

    test("Applies dark theme", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedView testID="themed-view"/>)

        const renderedView = screen.getByTestId("themed-view")
        expect(renderedView.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.background })
            ])
        )
    })


    test("Applies dark theme when Colors[colorScheme] is null", () => {
        useColorScheme.mockReturnValue("null")
        render(<ThemedView testID="themed-view"/>)

        const renderedView = screen.getByTestId("themed-view")
        expect(renderedView.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.background })
            ])
        )
    })
})
