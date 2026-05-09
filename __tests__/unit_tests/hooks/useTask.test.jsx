import { jest, describe, it, expect } from '@jest/globals'
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useTask } from '../../../hooks/useTask'
import { TaskContext } from '../../../contexts/taskContext'

jest.mock('../../../contexts/taskContext', () => ({
    TaskContext: require('react').createContext(null)
}))

describe('useTask', () => {
    it('should throw an error if used outside of provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        expect(() => renderHook(() => useTask())).toThrow('useTask must be used within a TaskProvider')
        consoleSpy.mockRestore()
    })

    it('should return the context value when used within provider', () => {
        const mockContextValue = { testValue: 'mocked' }
        const wrapper = ({ children }) => (
            <TaskContext.Provider value={mockContextValue}>
                {children}
            </TaskContext.Provider>
        )

        const { result } = renderHook(() => useTask(), { wrapper })
        expect(result.current).toEqual(mockContextValue)
    })
})