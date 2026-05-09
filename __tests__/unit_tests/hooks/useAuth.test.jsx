import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useAuth } from '../../../hooks/useAuth'
import { AuthContext } from '../../../contexts/authContext'


jest.mock('../../../contexts/authContext', () => ({
    AuthContext: require('react').createContext(null)
}))

describe('useAuth', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within a UserProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <AuthContext.Provider value={mockContextValue}>
                {children}
            </AuthContext.Provider>
        )

        const { result } = renderHook(() => useAuth(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})