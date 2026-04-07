import React from 'react'
import { Alert, Text } from 'react-native'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

import Login from '../../app/(auth)/login'
import { UserProvider } from '../../contexts/userContext'
import { useUser } from '../../hooks/useUser'

// Component used to check the authentication
const AuthStateProbe = () => {
	const { user } = useUser()

    // Renders different text based on the authentication state of the user
	return user ? (
		<Text testID="authenticated-screen">Hello, {user}!</Text>
	) : (
		<Text testID="login-screen">Login to continue</Text>
	)
}

const renderLoginIntegration = () => {
    // Wraps the login with a user provider (to allow context usage)
    // Below that we see the probe
	return render(
		<UserProvider>
			<Login />
			<AuthStateProbe />
		</UserProvider>
	)
}

describe('Login Integration', () => {
	afterEach(() => {
		jest.restoreAllMocks()
	})

	test('valid credentials authenticate the user and show authenticated content', async () => {
		renderLoginIntegration()

        // Initially expects to have the login screen 
		expect(screen.getByTestId('login-screen')).toBeTruthy()

        // Inputs the correct credentials and submits the form
		fireEvent.changeText(screen.getByTestId('login-username-input'), 'John Doe')
		fireEvent.changeText(screen.getByTestId('login-password-input'), '1234')
		fireEvent.press(screen.getByTestId('login-submit-button'))

        // Since login is async, we have to wait for its output
		await waitFor(() => {
			expect(screen.getByTestId('authenticated-screen')).toBeTruthy()
			expect(screen.queryByTestId('login-screen')).toBeNull()
		})

        // Checks if the current screen is the expected, with correct text
		expect(screen.getByText('Hello, John Doe!')).toBeTruthy()
	})

	test('invalid credentials keep user unauthenticated', async () => {
        // Mocks the alert function
		const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})

        // Login rendering
		renderLoginIntegration()

        // Executes events needed to login
		fireEvent.changeText(screen.getByTestId('login-username-input'), 'John Doe')
		fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrong')
		fireEvent.press(screen.getByTestId('login-submit-button'))

        // Checks current screen
		await waitFor(() => {
			expect(screen.getByTestId('login-screen')).toBeTruthy()
			expect(screen.queryByTestId('authenticated-screen')).toBeNull()
		})

        // Checks if the instance called alert with the expected parameters
		expect(alertSpy).toHaveBeenCalledWith(
			'Invalid credentials',
			'Please insert correct credentials.'
		)
	})
})