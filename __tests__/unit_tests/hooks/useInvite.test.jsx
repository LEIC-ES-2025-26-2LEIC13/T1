import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useInvite } from '../../../hooks/useInvite'
import { InviteContext } from '../../../contexts/inviteContext'


jest.mock('../../../contexts/inviteContext', () => ({
    InviteContext: require('react').createContext(null)
}))

describe('useInvite', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useInvite())).toThrow('useInvite must be used within an InviteProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <InviteContext.Provider value={mockContextValue}>
                {children}
            </InviteContext.Provider>
        )

        const { result } = renderHook(() => useInvite(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})