import { render, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedCard from '../../components/ThemedCard'
import ThemedTextInput from '../../components/ThemedTextInput'

// every time the module 'react-native' is imported in tests, the mock implementation will be used instead of the actual module
jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn()
    return actualModule
})

describe("ThemedTextInput", () => {

    test("Applies light theme", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedTextInput testID="themed-text-input" />)

        const renderedTextInput = screen.getByTestId("themed-text-input")
        expect(renderedTextInput.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.navBackground, color: Colors.light.text })
            ])
        )
    })

    test("Applies dark theme", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedTextInput testID="themed-text-input" />)

        const renderedTextInput = screen.getByTestId("themed-text-input")
        expect(renderedTextInput.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.navBackground, color: Colors.dark.text })
            ])
        )
    })
})
