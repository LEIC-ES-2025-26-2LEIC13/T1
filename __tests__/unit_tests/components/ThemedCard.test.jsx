import { jest, describe, expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors'
import ThemedCard from '../../../components/ThemedCard'

// every time the module 'react-native' is imported in tests, the mock implementation will be used instead of the actual module
jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn()
    return actualModule
})

describe("ThemedCard", () => {

    test("Applies light theme", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedCard testID="themed-card" />)

        const renderedCard = screen.getByTestId("themed-card")
        expect(renderedCard.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.uiBackground })
            ])
        )
    })

    test("Applies dark theme", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedCard testID="themed-card" />)

        const renderedCard = screen.getByTestId("themed-card")
        expect(renderedCard.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.uiBackground })
            ])
        )
    })
})


