import { jest, describe, expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react-native'

import { useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors'
import ThemedText from '../../../components/ThemedText'

// every time the module 'react-native' is imported in tests, the mock implementation will be used instead of the actual module
jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn()
    return actualModule
})

describe("ThemedText", () => {

    test("Applies light theme to text", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedText testID="themed-text" />)

        const renderedText = screen.getByTestId("themed-text")
        expect(renderedText.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ color: Colors.light.text })
            ])
        )
    })

    test("Applies dark theme to text", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedText testID="themed-text" />)

        const renderedText = screen.getByTestId("themed-text")
        expect(renderedText.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ color: Colors.dark.text })
            ])
        )
    })

    test("Applies light theme to title text", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedText title={true} testID="themed-text" />)

        const renderedText = screen.getByTestId("themed-text")
        expect(renderedText.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ color: Colors.light.title })
            ])
        )
    })

    test("Applies dark theme to title text", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedText title={true} testID="themed-text" />)

        const renderedText = screen.getByTestId("themed-text")
        expect(renderedText.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ color: Colors.dark.title })
            ])
        )
    })
})
