import { collection, doc, onSnapshot, query, updateDoc, getDocs, writeBatch } from "firebase/firestore"
import { projectService } from '../../../api/projectService'
import { batchDelete } from '../../../api/batchDeleteHelper'

// Setup mocks
const mockSet = jest.fn()
const mockDelete = jest.fn()
const mockCommit = jest.fn().mockResolvedValue(true) // Value returned from a successful promise

// Mock Firebase dependencies
jest.mock('firebase/firestore', () => ({
    addDoc: jest.fn(),
    collection: jest.fn((db, path) => `collection_${path}`),
    doc: jest.fn((db, ...paths) => ({
        // The first id value corresponds to the doc id already existing and the second one is for when a new doc is created, like the random id created by the firebase 
        id: paths[paths.length - 1] || 'mock-random-id', 
        path: paths.join('/') // collections and docs are subdivided like folders
    })),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    updateDoc: jest.fn(),
    getDocs: jest.fn(),
    writeBatch: jest.fn(() => ({
        set: mockSet,
        delete: mockDelete,
        commit: mockCommit
    }))
}))

jest.mock('../../../firebase/firebaseConfig.js', () => ({
    db: {} // Mock database object
}))

jest.mock('../../../api/batchDeleteHelper', () => ({
    batchDelete: jest.fn()
}))

describe('Test Project Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch project data from database, with onSnapshot', () => {
        // Mock the data to be fetched by a new user
        const mockProjects = [
            { data: () => ({ projectId: 'proj-1', title: 'Project One', description: 'Desc One' }) },
            { data: () => ({ projectId: 'proj-2', title: 'Project Two', description: 'Desc Two' }) }
        ]
        
        // Fully mocked interaction with on snapshot, including the callback that will update the projects of that user
        onSnapshot.mockImplementation((query, callback) => {
            callback({ docs: mockProjects })
            return jest.fn() // unsubscribe is also mocked
        })
        
        const mockOnUpdate = jest.fn() // mocked on update

        // Act
        projectService.subscribeToUserProjects('user-123', mockOnUpdate)

        // Assert if the functions were called
        expect(onSnapshot).toHaveBeenCalled()
        expect(mockOnUpdate).toHaveBeenCalledWith([
            { id: 'proj-1', projectId: 'proj-1', title: 'Project One', description: 'Desc One' },
            { id: 'proj-2', projectId: 'proj-2', title: 'Project Two', description: 'Desc Two' }
        ])
    })

    it('should fetch no existing projects from the db', () => {
        // Arrange
        onSnapshot.mockImplementation((query, callback) => {
            callback({ docs: [] }) // Simulate empty snapshot
            return jest.fn()
        })
        const mockOnUpdate = jest.fn()

        // Act
        projectService.subscribeToUserProjects('user-123', mockOnUpdate)

        // Assert
        expect(mockOnUpdate).toHaveBeenCalledWith([])
    })

    it('should create Project with normalized data', async () => {
        const projectData = { title: '  My New Project  ', description: '  Needs trimming  ' }

        await projectService.createProject('user-123', 'test@email.com', projectData)

        expect(writeBatch).toHaveBeenCalled()
        expect(mockSet).toHaveBeenCalledTimes(3) // 1. project, 2. projectUsers, 3. userProjects
        
        // Check if data was properly trimmed (normalized)
        expect(mockSet.mock.calls[0][1]).toEqual(expect.objectContaining({
            title: 'My New Project',
            description: 'Needs trimming',
            createdBy: 'user-123'
        }))
        expect(mockCommit).toHaveBeenCalled()
    })

    it('should throw error when creating project without title', async () => {
        // Extra test: Validate error handling for empty titles
        const invalidData = { title: '   ', description: 'No title' }
        
        await expect(
            projectService.createProject('user-123', 'test@email.com', invalidData)
        ).rejects.toThrow('Please enter a project title')
    })
})

describe('Update Project', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    const projectId = 'proj-123'

    it('should update project with both title and description existing', async () => {
        const updates = { title: ' New Title ', description: ' New Desc ' }

        await projectService.updateProject(projectId, updates)

        expect(updateDoc).toHaveBeenCalledTimes(1)
        expect(updateDoc.mock.calls[0][1]).toEqual({ 
            title: 'New Title', 
            description: 'New Desc' 
        })
    })

    it('should update project with title existing and description not set (undefined)', async () => {
        const updates = { title: ' Updated Title ', description: undefined }

        await projectService.updateProject(projectId, updates)

        expect(updateDoc).toHaveBeenCalledTimes(1)
        expect(updateDoc.mock.calls[0][1]).toEqual({ title: 'Updated Title' })
    })

    it('should update project with description existing and title not set (undefined)', async () => {
        const updates = { title: undefined, description: ' Updated Desc ' }

        await projectService.updateProject(projectId, updates)

        expect(updateDoc).toHaveBeenCalledTimes(1)
        expect(updateDoc.mock.calls[0][1]).toEqual({ description: 'Updated Desc' })
    })

    it('should exit early and not call updateDoc if neither title nor description are provided', async () => {
        const updates = { title: undefined, description: undefined }

        await projectService.updateProject(projectId, updates)

        expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should throw error when updating project with an empty title', async () => {
        const updates = { title: '   ', description: ' Valid Desc ' }

        await expect(projectService.updateProject(projectId, updates))
            .rejects.toThrow('Project title cannot be empty')
        
        expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should handle null values by treating them as empty strings and throwing error if title becomes empty', async () => {
        const updates = { title: null, description: null }

        await expect(projectService.updateProject(projectId, updates))
            .rejects.toThrow('Project title cannot be empty')
            
        expect(updateDoc).not.toHaveBeenCalled()
    })
})

it('Delete all project related data from the database', async () => {
    // Arrange
    const projectId = 'proj-123'
    
    // Mock the snapshots returned by getDocs (Tasks and ProjectUsers)
    const mockTasksSnapshot = [
        { ref: { id: 'task-1' } }, 
        { ref: { id: 'task-2' } }
    ]
    
    const mockProjectUsersSnapshot = [
        { ref: { id: 'userRef-1' }, data: () => ({ userId: 'user-1' }) },
        { ref: { id: 'userRef-2' }, data: () => ({ userId: 'user-2' }) }
    ]

    // getDocs is called twice in the function. We resolve them sequentially.
    getDocs
        .mockResolvedValueOnce(mockTasksSnapshot) // 1st call: tasks
        .mockResolvedValueOnce(mockProjectUsersSnapshot) // 2nd call: projectUsers

    // Act
    await projectService.deleteProject(projectId)

    // Assert
    expect(getDocs).toHaveBeenCalledTimes(2)
    
    // Verify batchDelete was called with all gathered references
    expect(batchDelete).toHaveBeenCalledTimes(1)
    
    const refsToDelete = batchDelete.mock.calls[0][1]
    // Total refs should be: 2 tasks + 2 projectUsers docs + 2 userProject references(remove the project from the users that were part of it) + 1 main project doc = 7
    expect(refsToDelete.length).toBe(7)
})

describe('Kick Member and Project Members Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should remove a member from a project using batch delete', async () => {
        const projectId = 'proj-123'
        const userId = 'user-456'

        await projectService.kickMember(projectId, userId)
        
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'projects', projectId, 'projectUsers', userId)
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', userId, 'userProjects', projectId)

        expect(writeBatch).toHaveBeenCalledTimes(1)
        expect(mockDelete).toHaveBeenCalledTimes(2)
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ id: userId })) // projectUsers doc
        expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({ id: projectId })) // userProjects doc
        expect(mockCommit).toHaveBeenCalledTimes(1)
    })

    it('should return true if project has no members', async () => {
        const projectId = 'proj-empty'
        
        // Mock getDocs to return an empty snapshot
        getDocs.mockResolvedValueOnce({ empty: true })

        const result = await projectService.projectHasNoMembers(projectId)

        // Verify the exact path being queried for project users
        expect(collection).toHaveBeenCalledWith(expect.anything(), 'projects', projectId, 'projectUsers')
        expect(getDocs).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
    })

    it('should return false if project has members', async () => {
        const projectId = 'proj-populated'
        
        // Mock getDocs to return a non-empty snapshot
        getDocs.mockResolvedValueOnce({ empty: false })

        const result = await projectService.projectHasNoMembers(projectId)

        // Verify the exact path being queried for project users
        expect(collection).toHaveBeenCalledWith(expect.anything(), 'projects', projectId, 'projectUsers')
        expect(getDocs).toHaveBeenCalledTimes(1)
        expect(result).toBe(false)
    })
})