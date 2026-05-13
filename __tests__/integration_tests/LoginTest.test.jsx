import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import Login from '../../app/(auth)/login'; // Adjust path if necessary
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

// --- Mocks ---

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn()
}));

// Mock simple visual components
jest.mock('../../components/ThemedGradient', () => {
    const { View } = require('react-native');
    return () => <View testID="themed-gradient" />;
});

jest.mock('../../components/auth/BrandingContainer', () => {
    const { View } = require('react-native');
    return () => <View testID="branding-container" />;
});

jest.mock('../../components/auth/AuthBody', () => {
    const { View } = require('react-native');
    return ({ children }) => <View testID="auth-body">{children}</View>;
});

jest.mock('../../components/Spacer', () => () => null);

jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children }) => <Text>{children}</Text>;
});

// Mock interactive components
jest.mock('../../components/auth/AuthField', () => {
    const { TextInput, View, Pressable } = require('react-native');
    return ({ testID, value, onChangeText, onRightIconPress, secureTextEntry }) => (
        <View>
            <TextInput 
                testID={testID} 
                value={value} 
                onChangeText={onChangeText} 
                secureTextEntry={secureTextEntry} 
            />
            {onRightIconPress && (
                <Pressable testID={`${testID}-icon`} onPress={onRightIconPress} />
            )}
        </View>
    );
});

jest.mock('../../components/ThemedButton', () => {
    const { Pressable } = require('react-native');
    return ({ testID, onPress, disabled, children }) => (
        <Pressable 
            testID={testID} 
            onPress={onPress} 
            disabled={disabled}
            accessibilityState={{ disabled: !!disabled }} // <-- Add this line
        >
            {children}
        </Pressable>
    );
});
jest.mock('../../components/auth/AuthFooter', () => {
    const { Pressable } = require('react-native');
    return ({ onPress }) => (
        <Pressable testID="auth-footer" onPress={onPress} />
    );
});

jest.mock('../../components/ThemedAlert', () => {
    const { Pressable, View, Text } = require('react-native');
    const ALERT_TYPES = { ERROR: 'error', SUCCESS: 'success' };
    
    function MockThemedAlert({ visible, alert, onConfirm }) {
        if (!visible) return null;
        return (
            <View testID="themed-alert">
                <Text>{alert.title}</Text>
                <Text>{alert.message}</Text>
                <Pressable testID="alert-confirm" onPress={onConfirm} />
            </View>
        );
    }
    return { __esModule: true, default: MockThemedAlert, ALERT_TYPES };
});

// --- Test Suite ---

describe('Login Screen', () => {
    const mockLogin = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useAuth.mockReturnValue({
            login: mockLogin,
            isLoading: false
        });

        useRouter.mockReturnValue({
            push: mockPush
        });
    });

    it('renders all main components correctly', () => {
        render(<Login />);
        expect(screen.getByTestId('themed-gradient')).toBeTruthy();
        expect(screen.getByTestId('branding-container')).toBeTruthy();
        expect(screen.getByTestId('auth-body')).toBeTruthy();
        expect(screen.getByTestId('login-email-input')).toBeTruthy();
        expect(screen.getByTestId('login-password-input')).toBeTruthy();
        expect(screen.getByTestId('login-submit-button')).toBeTruthy();
        expect(screen.getByTestId('auth-footer')).toBeTruthy();
    });

    it('updates email and password state on user input', () => {
        render(<Login />);
        
        const emailInput = screen.getByTestId('login-email-input');
        const passwordInput = screen.getByTestId('login-password-input');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');

        expect(emailInput.props.value).toBe('test@example.com');
        expect(passwordInput.props.value).toBe('password123');
    });

    it('toggles password visibility when the right icon is pressed', () => {
        render(<Login />);
        
        const passwordInput = screen.getByTestId('login-password-input');
        const toggleIcon = screen.getByTestId('login-password-input-icon');

        // Initially secure
        expect(passwordInput.props.secureTextEntry).toBe(true);

        // Press toggle
        fireEvent.press(toggleIcon);

        // Should no longer be secure
        expect(passwordInput.props.secureTextEntry).toBe(false);

        // Press toggle again
        fireEvent.press(toggleIcon);

        // Should be secure again
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('shows an error alert when trying to submit with missing fields', async () => {
        render(<Login />);
        
        const submitButton = screen.getByTestId('login-submit-button');

        // Submit without typing anything
        fireEvent.press(submitButton);

        // login function should not have been called
        expect(mockLogin).not.toHaveBeenCalled();

        // Alert should be visible
        await waitFor(() => {
            expect(screen.getByTestId('themed-alert')).toBeTruthy();
            expect(screen.getByText('Missing fields')).toBeTruthy();
            expect(screen.getByText('Please enter both email and password.')).toBeTruthy();
        });
    });

    it('dismisses the alert when confirm button is pressed', async () => {
        render(<Login />);
        
        // Trigger alert
        fireEvent.press(screen.getByTestId('login-submit-button'));
        
        await waitFor(() => {
            expect(screen.getByTestId('themed-alert')).toBeTruthy();
        });

        // Dismiss alert
        fireEvent.press(screen.getByTestId('alert-confirm'));

        await waitFor(() => {
            expect(screen.queryByTestId('themed-alert')).toBeNull();
        });
    });

    it('calls login function successfully with valid inputs', async () => {
        render(<Login />);
        
        fireEvent.changeText(screen.getByTestId('login-email-input'), 'user@example.com');
        fireEvent.changeText(screen.getByTestId('login-password-input'), 'SecurePass1!');
        
        fireEvent.press(screen.getByTestId('login-submit-button'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'SecurePass1!');
        });
    });

    it('navigates to register screen when footer link is pressed', () => {
        render(<Login />);
        
        const footer = screen.getByTestId('auth-footer');
        fireEvent.press(footer);

        expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
    });

    it('disables the submit button when isLoading is true', () => {
        // Override mock for this specific test
        useAuth.mockReturnValue({
            login: mockLogin,
            isLoading: true
        });

        render(<Login />);
        
        const submitButton = screen.getByTestId('login-submit-button');
        expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });
});