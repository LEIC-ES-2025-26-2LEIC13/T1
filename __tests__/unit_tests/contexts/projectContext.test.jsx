import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import React, { useContext } from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { ProjectContext, ProjectProvider } from '../../../contexts/projectContext'
import { projectService } from '../../../api/projectService'
import { useAuth } from '../../../hooks/useAuth'

jest.mock('../../../api/projectService', () => ({
    projectService: {
        subscribeToUserProjects: jest.fn(),
        createProject: jest.fn(),
        updateProject: jest.fn(),
        deleteProject: jest.fn(),
        kickMember: jest.fn()
    }
}))

jest.mock('../../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}))

describe('ProjectContext', () => {
    let wrapper

    beforeEach(() => {
        jest.clearAllMocks()
        wrapper = ({ children }) => <ProjectProvider>{children}</ProjectProvider>
    })

    it('should set projects to empty array if user is missing', () => {
        useAuth.mockReturnValue({ user: null })
        const { result } = renderHook(() => useContext(ProjectContext), { wrapper })

        expect(result.current.projects).toEqual([])
        expect(projectService.subscribeToUserProjects).not.toHaveBeenCalled()
    })

    it('should subscribe to projects and handle loading state', () => {
        useAuth.mockReturnValue({ user: { uid: 'u1' } })
        const mockUnsubscribe = jest.fn()
        
        projectService.subscribeToUserProjects.mockImplementation((uid, callback) => {
            callback([{ id: 'p1' }])
            return mockUnsubscribe
        })

        const { result, unmount } = renderHook(() => useContext(ProjectContext), { wrapper })

        expect(projectService.subscribeToUserProjects).toHaveBeenCalledWith('u1', expect.any(Function))
        expect(result.current.projects).toEqual([{ id: 'p1' }])
        expect(result.current.isLoadingProjects).toBe(false)

        unmount()
        expect(mockUnsubscribe).toHaveBeenCalled()
    })

    describe('API Actions', () => {
        let currentResult

        beforeEach(() => {
            useAuth.mockReturnValue({ user: { uid: 'u1', email: 'test@test.com' } })

            projectService.subscribeToUserProjects.mockImplementation((uid, cb) => jest.fn())
            const { result } = renderHook(() => useContext(ProjectContext), { wrapper })
            currentResult = result
        })

        it('should call createProject API', async () => {
            const projectData = { title: 'New Project' }
            await act(async () => {
                await currentResult.current.createProject(projectData)
            })
            expect(projectService.createProject).toHaveBeenCalledWith('u1', 'test@test.com', projectData)
        })

        it('should call updateProject API', async () => {
            await act(async () => {
                await currentResult.current.updateProject('p1', { title: 'Updated' })
            })
            expect(projectService.updateProject).toHaveBeenCalledWith('p1', { title: 'Updated' })
        })

        it('should call deleteProject API', async () => {
            await act(async () => {
                await currentResult.current.deleteProject('p1')
            })
            expect(projectService.deleteProject).toHaveBeenCalledWith('p1')
        })

        it('should call kickMember API', async () => {
            await act(async () => {
                await currentResult.current.kickMember('p1', 'm1')
            })
            expect(projectService.kickMember).toHaveBeenCalledWith('p1', 'm1')
        })
    })
})