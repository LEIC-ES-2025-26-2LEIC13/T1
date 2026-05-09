import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import React, { useContext } from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { ColumnContext, ColumnProvider } from '../../../contexts/columnContext'
import { columnService } from '../../../api/columnService'

jest.mock('../../../api/columnService', () => ({
    columnService: {
        subscribeToProjectColumns: jest.fn(),
        createColumn: jest.fn(),
        deleteColumn: jest.fn(),
        updateColumn: jest.fn()
    }
}))

describe('ColumnContext', () => {
    let wrapper

    beforeEach(() => {
        jest.clearAllMocks()
        wrapper = ({ children }) => <ColumnProvider>{children}</ColumnProvider>
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useContext(ColumnContext), { wrapper })
        expect(result.current.columns).toEqual([])
        expect(result.current.isLoadingColumns).toBe(false)
        expect(result.current.activeProjectId).toBe('')
    })

    it('should handle project columns subscription lifecycle', async () => {
        const mockUnsubscribe = jest.fn()
        columnService.subscribeToProjectColumns.mockImplementation((id, callback) => {
            callback([{ id: 'c1', name: 'To Do' }])
            return mockUnsubscribe
        })

        const { result } = renderHook(() => useContext(ColumnContext), { wrapper })

        // Activating a project should fetch
        await act(() => result.current.setActiveProjectId('p1'))
        expect(columnService.subscribeToProjectColumns).toHaveBeenCalledWith('p1', expect.any(Function))
        expect(result.current.columns).toEqual([{ id: 'c1', name: 'To Do' }])

        // Deactivating should clear columns
        await act(() => result.current.setActiveProjectId(''))
        expect(result.current.columns).toEqual([])
    })

    describe('API Actions', () => {
        let currentResult

        beforeEach(async () => {
            const { result } = renderHook(() => useContext(ColumnContext), { wrapper })
            await act(() => result.current.setActiveProjectId('p1'))
            currentResult = result
        })

        it('should call createColumn API', async () => {
            await act(() => currentResult.current.createColumn({ name: 'New Col' }))
            expect(columnService.createColumn).toHaveBeenCalledWith('p1', { name: 'New Col' })
        })

        it('should call updateColumn API', async () => {
            await act(() => currentResult.current.updateColumn('c1', { name: 'Updated' }))
            expect(columnService.updateColumn).toHaveBeenCalledWith('p1', 'c1', { name: 'Updated' })
        })

        it('should call deleteColumn API', async () => {
            await act(() => currentResult.current.deleteColumn('c1'))
            expect(columnService.deleteColumn).toHaveBeenCalledWith('p1', 'c1')
        })
    })
})