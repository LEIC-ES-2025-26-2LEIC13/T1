import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useTemplate } from '../../../hooks/useTemplate'
import { TemplateContext } from '../../../contexts/templateContext'

jest.mock('../../../contexts/templateContext', () => ({
    TemplateContext: require('react').createContext(null)
}))

describe('useTemplate', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useTemplate())).toThrow('useTemplate must be used within a TemplateProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <TemplateContext.Provider value={mockContextValue}>
                {children}
            </TemplateContext.Provider>
        )

        const { result } = renderHook(() => useTemplate(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})
