import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useColumn } from '../../../hooks/useColumn'
import { ColumnContext } from '../../../contexts/columnContext'

jest.mock('../../../contexts/columnContext', () => ({
    ColumnContext: require('react').createContext(null)
}))

describe('useColumn', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useColumn())).toThrow('useColumn must be used within a ColumnProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <ColumnContext.Provider value={mockContextValue}>
                {children}
            </ColumnContext.Provider>
        )

        const { result } = renderHook(() => useColumn(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})