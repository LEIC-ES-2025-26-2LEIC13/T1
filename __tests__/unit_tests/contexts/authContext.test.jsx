import React, { useContext } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Text, Pressable } from 'react-native'; // <--- THIS WAS MISSING
import { AuthContext, AuthProvider } from '../../../contexts/authContext';
import { authService } from '../../../api/authService';

// --- Mocks ---

jest.mock('../../../api/authService', () => ({
    authService: {
        subscribeAuthState: jest.fn(),
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
    }
}));

jest.mock('../../../components/ThemedAlert', () => {
    const { View, Text, Pressable } = require('react-native');
    const MockAlert = ({ visible, alert, onConfirm }) => {
        if (!visible) return null;
        return (
            <View testID="mock-alert">
                <Text testID="alert-type">{alert.type}</Text>
                <Text testID="alert-title">{alert.title}</Text>
                <Text testID="alert-message">{alert.message}</Text>
                <Pressable testID="alert-confirm" onPress={onConfirm} />
            </View>
        );
    };
    MockAlert.ALERT_TYPES = { ERROR: 'error', SUCCESS: 'success' };
    return { __esModule: true, default: MockAlert, ALERT_TYPES: MockAlert.ALERT_TYPES };
});

// --- Test Consumer Component ---
const TestConsumer = () => {
    const { user, isLoading, login, register, logout } = useContext(AuthContext);
    return (
        <>
            <Text testID="user-state">{user ? user.email : 'null'}</Text>
            <Text testID="loading-state">{isLoading ? 'true' : 'false'}</Text>
            <Pressable testID="btn-login" onPress={() => login('test@example.com', 'password123')} />
            <Pressable testID="btn-register" onPress={() => register('test@example.com', 'password123')} />
            <Pressable testID="btn-logout" onPress={() => logout()} />
        </>
    );
};

const TestWrapper = () => (
    <AuthProvider>
        <TestConsumer />
    </AuthProvider>
);

describe('AuthContext and AuthProvider', () => {
    let mockUnsubscribe;
    let authStateCallback;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUnsubscribe = jest.fn();
        authService.subscribeAuthState.mockImplementation((cb) => {
            authStateCallback = cb;
            return mockUnsubscribe;
        });
    });

    describe('Initialization & Cleanup', () => {
        it('starts in a loading state and updates when auth state resolves', () => {
            render(<TestWrapper />);
            expect(screen.getByTestId('loading-state').props.children).toBe('true');
            expect(screen.getByTestId('user-state').props.children).toBe('null');

            act(() => {
                authStateCallback({ email: 'user@example.com' });
            });

            expect(screen.getByTestId('loading-state').props.children).toBe('false');
            expect(screen.getByTestId('user-state').props.children).toBe('user@example.com');
        });

        it('calls the unsubscribe function on unmount', () => {
            const { unmount } = render(<TestWrapper />);
            unmount();
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe('Login Functionality', () => {
        it('calls authService.login successfully', async () => {
            authService.login.mockResolvedValueOnce();

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-login'));

            await waitFor(() => {
                expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123', expect.any(Function));
            });
            expect(screen.queryByTestId('mock-alert')).toBeNull();
        });

        const loginErrorCases = [
            { code: 'auth/invalid-email', expectedMsg: 'The email address is invalid.' },
            { code: 'auth/user-disabled', expectedMsg: 'This account has been disabled.' },
            { code: 'auth/user-not-found', expectedMsg: 'No account found with this email. Please register first.' },
            { code: 'auth/wrong-password', expectedMsg: 'Incorrect email or password. Please try again.' },
            { code: 'auth/invalid-credential', expectedMsg: 'Incorrect email or password. Please try again.' },
            { code: 'auth/too-many-requests', expectedMsg: 'Too many failed login attempts. Please try again later.' },
            { code: 'auth/network-request-failed', expectedMsg: 'Network error. Please check your internet connection.' },
            { code: 'unknown-error', expectedMsg: 'Firebase random error' },
        ];

        it.each(loginErrorCases)('handles login error code $code correctly', async ({ code, expectedMsg }) => {
            authService.login.mockRejectedValueOnce({ code, message: 'Firebase random error' });

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-login'));

            await waitFor(() => {
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            expect(screen.getByTestId('alert-type').props.children).toBe('error');
            expect(screen.getByTestId('alert-title').props.children).toBe('Login Error');
            expect(screen.getByTestId('alert-message').props.children).toBe(expectedMsg);
            expect(screen.getByTestId('loading-state').props.children).toBe('false');
        });
    });

    describe('Register Functionality', () => {
        it('calls authService.register successfully and shows success alert', async () => {
            authService.register.mockResolvedValueOnce();

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-register'));

            await waitFor(() => {
                expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123', expect.any(Function));
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            expect(screen.getByTestId('alert-type').props.children).toBe('success');
            expect(screen.getByTestId('alert-title').props.children).toBe('Success');
            expect(screen.getByTestId('alert-message').props.children).toBe('Account created successfully!');
        });

        const registerErrorCases = [
            { code: 'auth/email-already-in-use', expectedMsg: 'This email is already registered. Please use a different email or login instead.' },
            { code: 'auth/invalid-email', expectedMsg: 'The email address is invalid. Please check and try again.' },
            { code: 'auth/weak-password', expectedMsg: 'The password is too weak. Please use at least 6 characters.' },
            { code: 'auth/operation-not-allowed', expectedMsg: 'Account creation is currently disabled. Please try again later.' },
            { code: 'unknown-error', expectedMsg: 'Firebase random error' },
        ];

        it.each(registerErrorCases)('handles register error code $code correctly', async ({ code, expectedMsg }) => {
            authService.register.mockRejectedValueOnce({ code, message: 'Firebase random error' });

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-register'));

            await waitFor(() => {
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            expect(screen.getByTestId('alert-type').props.children).toBe('error');
            expect(screen.getByTestId('alert-title').props.children).toBe('Registration Error');
            expect(screen.getByTestId('alert-message').props.children).toBe(expectedMsg);
            expect(screen.getByTestId('loading-state').props.children).toBe('false');
        });
    });

    describe('Logout Functionality', () => {
        it('calls authService.logout successfully', async () => {
            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-logout'));

            await waitFor(() => {
                expect(authService.logout).toHaveBeenCalled();
            });
            expect(screen.queryByTestId('mock-alert')).toBeNull();
        });

        it('shows an error alert if logout fails synchronously', async () => {
            authService.logout.mockImplementationOnce(() => {
                throw new Error('Logout failed completely');
            });

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-logout'));

            await waitFor(() => {
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            expect(screen.getByTestId('alert-type').props.children).toBe('error');
            expect(screen.getByTestId('alert-title').props.children).toBe('Logout Error');
            expect(screen.getByTestId('alert-message').props.children).toBe('Logout failed completely');
            expect(screen.getByTestId('loading-state').props.children).toBe('false');
        });
    });

    describe('Alert Dismissal', () => {
        it('closes the alert when confirm button is pressed', async () => {
            authService.logout.mockImplementationOnce(() => {
                throw new Error('Trigger alert');
            });

            render(<TestWrapper />);
            fireEvent.press(screen.getByTestId('btn-logout'));

            await waitFor(() => {
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('alert-confirm'));

            await waitFor(() => {
                expect(screen.queryByTestId('mock-alert')).toBeNull();
            });
        });
    });
});