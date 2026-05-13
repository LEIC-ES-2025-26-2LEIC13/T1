import { jest, describe, expect, test, beforeEach } from '@jest/globals'
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../../constants/Colors'
import ThemedProject from '../../../components/ThemedProject'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush })
}))

jest.mock('react-native', () => {
    const actualModule = jest.requireActual('react-native')
    actualModule.useColorScheme = jest.fn()
    return actualModule
})

jest.mock('../../../components/ThemedText', () => {
    const React = require('react');
    const { Text } = require('react-native')
    return {
        __esModule: true,
        default: ({ children }) => <Text>{children}</Text>
    }
})

jest.mock('expo-linear-gradient', () => {
    const React = require('react');
    return {
        LinearGradient: ({ children }) => children ?? null
    }
})

jest.mock('../../../components/ThemedIcon', () => ({
    __esModule: true,
    default: () => null
}))

describe("ThemedProject", () => {

    beforeEach(() => {
        jest.clearAllMocks()
        useColorScheme.mockReturnValue('light')
    })

    test("Applies light theme", () => {
        useColorScheme.mockReturnValue("light")
        render(<ThemedProject testID="themed-project" />)

        const renderedProject = screen.getByTestId("themed-project")
        const innerCardView = renderedProject.children[0]

        expect(innerCardView.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.navBackground })
            ])
        )
    })

    test("Applies dark theme", () => {
        useColorScheme.mockReturnValue("dark")
        render(<ThemedProject testID="themed-project" />)

        const renderedProject = screen.getByTestId("themed-project")
        const innerCardView = renderedProject.children[0]

        expect(innerCardView.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.navBackground })
            ])
        )
    })

    test("Does not call router.push when pressed without projectId", () => {
        render(<ThemedProject testID="themed-project" />)

        fireEvent.press(screen.getByTestId("themed-project"))
        expect(mockPush).not.toHaveBeenCalled()
    })

    test("Calls router.push when pressed with projectId", () => {
        render(<ThemedProject testID="themed-project" projectId="project1" />)

        fireEvent.press(screen.getByTestId("themed-project"))
        expect(mockPush).toHaveBeenCalledTimes(1)
    })
})