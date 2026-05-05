import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import React, { useContext } from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { InviteContext, InviteProvider } from '../../../contexts/inviteContext'
import { inviteService } from '../../../api/inviteService'
import { useAuth } from '../../../hooks/useAuth'

jest.mock('../../../api/inviteService', () => ({
    inviteService: {
        subscribeToUserInvites: jest.fn(),
        sendInvite: jest.fn(),
        acceptInvite: jest.fn(),
        ignoreInvite: jest.fn()
    }
}))

jest.mock('../../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}))

describe('InviteContext', () => {
    let wrapper

    beforeEach(() => {
        jest.clearAllMocks()
        wrapper = ({ children }) => <InviteProvider>{children}</InviteProvider>
    })

    it('should clear invites if user is missing', () => {
        useAuth.mockReturnValue({ user: null })
        const { result } = renderHook(() => useContext(InviteContext), { wrapper })

        expect(result.current.invites).toEqual([])
        expect(inviteService.subscribeToUserInvites).not.toHaveBeenCalled()
    })

    it('should fetch invites and set notification flag', () => {
        useAuth.mockReturnValue({ user: { uid: 'u1' } })
        const mockUnsubscribe = jest.fn()
        
        inviteService.subscribeToUserInvites.mockImplementation((uid, callback) => {
            callback([{ id: 'i1' }]) 
            return mockUnsubscribe
        })

        const { result, unmount } = renderHook(() => useContext(InviteContext), { wrapper })

        expect(inviteService.subscribeToUserInvites).toHaveBeenCalledWith('u1', expect.any(Function))
        expect(result.current.invites).toEqual([{ id: 'i1' }])
        expect(result.current.hasNewInvites).toBe(true)

        unmount()
        expect(mockUnsubscribe).toHaveBeenCalled()
    })

    describe('API Actions', () => {
        let currentResult

        beforeEach(() => {
            useAuth.mockReturnValue({ user: { uid: 'u1', email: 'test@test.com' } })
            const { result } = renderHook(() => useContext(InviteContext), { wrapper })
            currentResult = result
        })

        it('should call sendInvite API', () => {
            const inviteData = { receiverId: 'r1', projectId: 'p1' }
            act(() => currentResult.current.sendInvite(inviteData))
            expect(inviteService.sendInvite).toHaveBeenCalledWith(inviteData)
        })

        it('should call acceptInvite API', () => {
            act(() => currentResult.current.acceptInvite({ id: 'i1', projectId: 'p1' }))
            expect(inviteService.acceptInvite).toHaveBeenCalledWith('u1', 'test@test.com', { id: 'i1', projectId: 'p1' })
        })

        it('should call ignoreInvite API', () => {
            act(() => currentResult.current.ignoreInvite({ id: 'i1' }))
            expect(inviteService.ignoreInvite).toHaveBeenCalledWith('u1', 'i1')
        })
    })
})