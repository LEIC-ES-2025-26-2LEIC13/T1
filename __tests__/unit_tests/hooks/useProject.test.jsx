import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useProject } from '../../../hooks/useProject'
import { ProjectContext } from '../../../contexts/projectContext'


jest.mock('../../../contexts/projectContext', () => ({
    ProjectContext: require('react').createContext(null)
}))

describe('useProject', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useProject())).toThrow('useProject must be used within a ProjectProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <ProjectContext.Provider value={mockContextValue}>
                {children}
            </ProjectContext.Provider>
        )

        const { result } = renderHook(() => useProject(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})