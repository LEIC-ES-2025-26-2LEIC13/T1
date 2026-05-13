import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import React, { useContext } from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { AuthContext, AuthProvider } from '../../../contexts/authContext'
import { authService } from '../../../api/authService'

jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() }
}))

jest.mock('../../../api/authService', () => ({
    authService: {
        subscribeAuthState: jest.fn(),
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn()
    }
}))

jest.mock('../../../components/ThemedText', () => {
    const { Text, StyleSheet } = jest.requireActual('react-native')
    return ({ children }) => <Text>{children}</Text>
})

jest.mock('../../../components/ThemedAlert', () => {
    const React = require('react')
    const { Alert } = require('react-native')
    return {
        __esModule: true,
        default: ({ visible, alert }) => {
            if (visible && alert) {
                Alert.alert(alert.title, alert.message)
            }
            return <></>
        },
        ALERT_TYPES: { ERROR: 'error', SUCCESS: 'success', WARNING: 'warning', INFO: 'info' }
    }
})

describe('AuthContext', () => {
    let wrapper

    beforeEach(() => {
        jest.clearAllMocks()
        wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
        authService.subscribeAuthState.mockReturnValue(jest.fn())
        jest.spyOn(console, 'error').mockImplementation(() => {}) 
    })

    it('should initialize and subscribe to auth state', () => {
        const mockUnsubscribe = jest.fn()
        authService.subscribeAuthState.mockImplementation((callback) => {
            callback({ uid: 'user1' }) 
            return mockUnsubscribe
        })

        const { result, unmount } = renderHook(() => useContext(AuthContext), { wrapper })

        expect(authService.subscribeAuthState).toHaveBeenCalled()
        expect(result.current.user).toEqual({ uid: 'user1' })
        expect(result.current.isLoading).toBe(false)

        unmount()
        expect(mockUnsubscribe).toHaveBeenCalled()
    })

    describe('login', () => {
        it('should handle successful login', async () => {
            authService.login.mockResolvedValueOnce()
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })

            await act(() => result.current.login('test@test.com', 'password123'))

            expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123', expect.any(Function))
            expect(result.current.isLoading).toBe(false)
        })

        it('should handle auth/invalid-email', async () => {
            const error = new Error(); error.code = 'auth/invalid-email'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'The email address is invalid.')
            expect(result.current.isLoading).toBe(false)
        })

        it('should handle auth/user-disabled', async () => {
            const error = new Error(); error.code = 'auth/user-disabled'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'This account has been disabled.')
        })

        it('should handle auth/user-not-found', async () => {
            const error = new Error(); error.code = 'auth/user-not-found'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'No account found with this email. Please register first.')
        })

        it('should handle auth/wrong-password', async () => {
            const error = new Error(); error.code = 'auth/wrong-password'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'Incorrect email or password. Please try again.')
        })

        it('should handle auth/invalid-credential', async () => {
            const error = new Error(); error.code = 'auth/invalid-credential'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'Incorrect email or password. Please try again.')
        })

        it('should handle auth/too-many-requests', async () => {
            const error = new Error(); error.code = 'auth/too-many-requests'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'Too many failed login attempts. Please try again later.')
        })

        it('should handle auth/network-request-failed', async () => {
            const error = new Error(); error.code = 'auth/network-request-failed'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'Network error. Please check your internet connection.')
        })

        it('should handle default unknown error', async () => {
            const error = new Error('Custom login error'); error.code = 'unknown'
            authService.login.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.login('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Login Error', 'Custom login error')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('register', () => {
        it('should handle successful registration', async () => {
            authService.register.mockResolvedValueOnce()
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })

            await act(() => result.current.register('test@test.com', 'password123'))

            expect(authService.register).toHaveBeenCalledWith('test@test.com', 'password123', expect.any(Function))
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created successfully!')
            expect(result.current.isLoading).toBe(false)
        })

        it('should handle auth/email-already-in-use', async () => {
            const error = new Error(); error.code = 'auth/email-already-in-use'
            authService.register.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.register('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'This email is already registered. Please use a different email or login instead.')
        })

        it('should handle auth/invalid-email', async () => {
            const error = new Error(); error.code = 'auth/invalid-email'
            authService.register.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.register('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'The email address is invalid. Please check and try again.')
        })

        it('should handle auth/weak-password', async () => {
            const error = new Error(); error.code = 'auth/weak-password'
            authService.register.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.register('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'The password is too weak. Please use at least 6 characters.')
        })

        it('should handle auth/operation-not-allowed', async () => {
            const error = new Error(); error.code = 'auth/operation-not-allowed'
            authService.register.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.register('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'Account creation is currently disabled. Please try again later.')
        })

        it('should handle default unknown error', async () => {
            const error = new Error('Custom register error'); error.code = 'unknown'
            authService.register.mockRejectedValueOnce(error)
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })
            await act(() => result.current.register('t', 'p'))
            expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'Custom register error')
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('logout', () => {
        it('should handle successful logout', async () => {
            authService.logout.mockResolvedValueOnce()
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })

            await act(() => result.current.logout())
            expect(authService.logout).toHaveBeenCalled()
            expect(result.current.isLoading).toBe(false)
        })

        it('should log error when logout fails', async () => {
            authService.logout.mockImplementationOnce(() => { throw new Error('Logout failed') })
            const { result } = renderHook(() => useContext(AuthContext), { wrapper })

            await act(async () => {
                await expect(result.current.logout()).rejects.toThrow('Logout failed')
            })
            expect(console.error).toHaveBeenCalledWith('Logout error:', 'Logout failed')
            expect(result.current.isLoading).toBe(false)
        })
    })
})