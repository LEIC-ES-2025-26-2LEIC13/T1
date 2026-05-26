import React, { useContext } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Text, Pressable } from 'react-native';
import { AuthContext, AuthProvider } from '../../../contexts/authContext';
import { authService } from '../../../api/authService';

jest.mock('../../../api/authService', () => ({
    authService: {
        subscribeAuthState: jest.fn(),
        signInWithGoogle: jest.fn(),
        signOut: jest.fn(),
        isAdmin: jest.fn(),
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

const TestConsumer = () => {
    const { user, isLoading, isAdmin, googleLogin, logout } = useContext(AuthContext);
    return (
        <>
            <Text testID="user-state">{user ? user.email : 'null'}</Text>
            <Text testID="loading-state">{isLoading ? 'true' : 'false'}</Text>
            <Text testID="admin-state">{isAdmin ? 'true' : 'false'}</Text>
            <Pressable testID="btn-google-login" onPress={() => googleLogin()} />
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
        it('starts in a loading state and updates when auth state resolves to null', () => {
            render(<TestWrapper />);
            expect(screen.getByTestId('loading-state').props.children).toBe('true');
            expect(screen.getByTestId('user-state').props.children).toBe('null');

            act(() => {
                authStateCallback(null);
            });

            expect(screen.getByTestId('loading-state').props.children).toBe('false');
            expect(screen.getByTestId('user-state').props.children).toBe('null');
            expect(screen.getByTestId('admin-state').props.children).toBe('false');
            expect(authService.isAdmin).not.toHaveBeenCalled();
        });

        it('sets isAdmin when auth state resolves to a user', async () => {
            authService.isAdmin.mockResolvedValueOnce(true);
            render(<TestWrapper />);

            act(() => {
                authStateCallback({ uid: 'u1', email: 'user@example.com' });
            });

            await waitFor(() => {
                expect(screen.getByTestId('loading-state').props.children).toBe('false');
                expect(screen.getByTestId('user-state').props.children).toBe('user@example.com');
                expect(screen.getByTestId('admin-state').props.children).toBe('true');
            });

            expect(authService.isAdmin).toHaveBeenCalledWith({ uid: 'u1', email: 'user@example.com' });
        });

        it('calls the unsubscribe function on unmount', () => {
            const { unmount } = render(<TestWrapper />);
            unmount();
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });
    });

    describe('Google Login', () => {
        it('calls authService.signInWithGoogle successfully', async () => {
            authService.signInWithGoogle.mockResolvedValueOnce();

            render(<TestWrapper />);
            act(() => {
                authStateCallback(null);
            });

            fireEvent.press(screen.getByTestId('btn-google-login'));

            await waitFor(() => {
                expect(authService.signInWithGoogle).toHaveBeenCalledWith(expect.any(Function));
            });
            expect(screen.queryByTestId('mock-alert')).toBeNull();
        });

        it('shows an error alert when sign-in fails', async () => {
            authService.signInWithGoogle.mockRejectedValueOnce(new Error('Google sign-in failed'));

            render(<TestWrapper />);
            act(() => {
                authStateCallback(null);
            });

            fireEvent.press(screen.getByTestId('btn-google-login'));

            await waitFor(() => {
                expect(screen.getByTestId('mock-alert')).toBeTruthy();
            });

            expect(screen.getByTestId('alert-type').props.children).toBe('error');
            expect(screen.getByTestId('alert-title').props.children).toBe('Login Error');
            expect(screen.getByTestId('alert-message').props.children).toBe('Google sign-in failed');
            expect(screen.getByTestId('loading-state').props.children).toBe('false');
        });
    });

    describe('Logout Functionality', () => {
        it('calls authService.signOut successfully', async () => {
            authService.signOut.mockResolvedValueOnce();

            render(<TestWrapper />);
            act(() => {
                authStateCallback(null);
            });

            fireEvent.press(screen.getByTestId('btn-logout'));

            await waitFor(() => {
                expect(authService.signOut).toHaveBeenCalled();
            });
            expect(screen.queryByTestId('mock-alert')).toBeNull();
        });

        it('shows an error alert if logout fails', async () => {
            authService.signOut.mockRejectedValueOnce(new Error('Logout failed completely'));

            render(<TestWrapper />);
            act(() => {
                authStateCallback(null);
            });

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
            authService.signOut.mockRejectedValueOnce(new Error('Trigger alert'));

            render(<TestWrapper />);
            act(() => {
                authStateCallback(null);
            });

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
