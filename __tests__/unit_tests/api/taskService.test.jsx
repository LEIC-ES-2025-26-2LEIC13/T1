import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { taskService } from '../../../api/taskService'; // Adjust path if needed
import { pathHelper } from '../../../api/pathHelper'; // Adjust path if needed
import { batchOps, OPERATION_TYPES } from '../../../api/batchOpsHelper'; // Adjust path if needed

// Mock batchOpsHelper
jest.mock('../../../api/batchOpsHelper', () => ({
    batchOps: jest.fn().mockResolvedValue(),
    OPERATION_TYPES: {
        DELETE: 'delete',
        SET: 'set',
        UPDATE: 'update'
    }
}));

// Mock pathHelper to return deterministic dummy paths
jest.mock('../../../api/pathHelper', () => ({
    pathHelper: {
        columnTasks: jest.fn((pId, cId) => `projects/${pId}/columns/${cId}/tasks`),
        columnTask: jest.fn((pId, cId, tId) => `projects/${pId}/columns/${cId}/tasks/${tId}`),
        userTasks: jest.fn((uId) => `users/${uId}/tasks`),
        userTask: jest.fn((uId, tId) => `users/${uId}/tasks/${tId}`)
    }
}));

// Mock Firebase Config
jest.mock('../../../firebase/firebaseConfig', () => ({
    db: 'mocked-db-instance'
}));

// Mock Firebase Firestore functions
const mockBatchSet = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue();
const mockWriteBatch = jest.fn(() => ({
    set: mockBatchSet,
    commit: mockBatchCommit
}));

const mockGetCountFromServer = jest.fn();
const mockDoc = jest.fn((path) => ({ id: `generated-id-for-${path}` }));
const mockQuery = jest.fn((ref, order) => `mocked-query(${ref}, ${order})`);
const mockOrderBy = jest.fn((field, dir) => `mocked-orderBy(${field}, ${dir})`);
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
    doc: (...args) => mockDoc(...args),
    getCountFromServer: (...args) => mockGetCountFromServer(...args),
    onSnapshot: (...args) => mockOnSnapshot(...args),
    writeBatch: () => mockWriteBatch(),
    orderBy: (...args) => mockOrderBy(...args),
    query: (...args) => mockQuery(...args),
    Timestamp: {
        now: jest.fn(() => 'mocked-timestamp')
    }
}));

describe('taskService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCountFromServer.mockResolvedValue({ data: () => ({ count: 5 }) }); // default mock
    });

    describe('subscribeToColumnTasks', () => {
        it('subscribes to a column query ordered by "order" asc and maps results correctly', () => {
            const mockOnUpdate = jest.fn();
            const projectId = 'p1';
            const columnId = 'c1';

            // Simulate the snapshot behavior
            const mockUnsubscribe = jest.fn();
            mockOnSnapshot.mockImplementation((queryRef, callback) => {
                callback({
                    docs: [
                        { id: 't1', data: () => ({ name: 'Task 1' }) },
                        { id: 't2', data: () => ({ name: 'Task 2' }) }
                    ]
                });
                return mockUnsubscribe;
            });

            const unsubscribe = taskService.subscribeToColumnTasks(projectId, columnId, mockOnUpdate);

            expect(mockOrderBy).toHaveBeenCalledWith('order', 'asc');
            expect(mockQuery).toHaveBeenCalledWith('projects/p1/columns/c1/tasks', 'mocked-orderBy(order, asc)');
            expect(mockOnUpdate).toHaveBeenCalledWith([
                { id: 't1', name: 'Task 1' },
                { id: 't2', name: 'Task 2' }
            ]);
            expect(unsubscribe).toBe(mockUnsubscribe);
        });
    });

    describe('subscribeToUserTasks', () => {
        it('subscribes to user tasks, maps them, and sorts by projectName then label', () => {
            const mockOnUpdate = jest.fn();
            
            mockOnSnapshot.mockImplementation((ref, callback) => {
                callback({
                    docs: [
                        { id: '1', data: () => ({ projectName: 'Proj B', label: 'Feature' }) },
                        { id: '2', data: () => ({ projectName: 'Proj A', label: 'Bug' }) },
                        { id: '3', data: () => ({ projectName: 'Proj A', label: 'Alpha' }) }
                    ]
                });
            });

            taskService.subscribeToUserTasks('u1', mockOnUpdate);

            expect(pathHelper.userTasks).toHaveBeenCalledWith('u1');
            
            // Should be ordered:
            // 1. Proj A / Alpha
            // 2. Proj A / Bug
            // 3. Proj B / Feature
            expect(mockOnUpdate).toHaveBeenCalledWith([
                { id: '3', projectName: 'Proj A', label: 'Alpha' },
                { id: '2', projectName: 'Proj A', label: 'Bug' },
                { id: '1', projectName: 'Proj B', label: 'Feature' }
            ]);
        });
    });

    describe('createTask', () => {
        it('throws an error if projectId is missing', async () => {
            await expect(
                taskService.createTask(null, 'Proj Name', 'col1', 'To Do', {})
            ).rejects.toThrow('Project ID is required to create a task');
        });

        it('normalizes task data, sets column task, sets user tasks, and commits batch', async () => {
            const taskData = {
                name: '  Needs Trim  ',
                description: '  Desc  ',
                label: ' Urgent ',
                assignedMembers: [{ id: 'm1' }, { id: 'm2' }]
            };

            await taskService.createTask('p1', 'Project One', 'c1', 'To Do', taskData);

            // Assert getCountFromServer was called to get the task order
            expect(mockGetCountFromServer).toHaveBeenCalledWith('projects/p1/columns/c1/tasks');
            
            // batch operations - 2 users + 1 column = 3 set calls
            expect(mockBatchSet).toHaveBeenCalledTimes(3);

            // Check normalized data passed to batch.set for the column task
            // The 3rd call is the column task (since loop over 2 members runs first)
            const columnTaskSetArgs = mockBatchSet.mock.calls[2];
            expect(columnTaskSetArgs[1]).toMatchObject({
                name: 'Needs Trim',
                description: 'Desc',
                label: 'Urgent',
                order: 5, // from mockGetCountFromServer
                createdAt: 'mocked-timestamp'
            });

            expect(mockBatchCommit).toHaveBeenCalled();
        });

        it('handles null/undefined fields in task data gracefully', async () => {
            const emptyTaskData = {}; // undefined name, desc, label, assignedMembers
            
            await taskService.createTask('p1', 'Project', 'c1', 'Col', emptyTaskData);

            // 0 members + 1 column task = 1 batch.set call
            expect(mockBatchSet).toHaveBeenCalledTimes(1);

            const setArgs = mockBatchSet.mock.calls[0];
            expect(setArgs[1]).toMatchObject({
                name: '',
                description: '',
                label: '',
                assignedMembers: []
            });
        });
    });

    describe('getTaskRefsToDelete', () => {
        it('returns correct DELETE operations for column and assigned members', () => {
            const operations = taskService.getTaskRefsToDelete('p1', 'c1', 't1', [{ id: 'u1' }, { id: 'u2' }]);

            expect(operations).toHaveLength(3);
            expect(operations).toEqual([
                { type: 'delete', ref: 'projects/p1/columns/c1/tasks/t1' },
                { type: 'delete', ref: 'users/u1/tasks/t1' },
                { type: 'delete', ref: 'users/u2/tasks/t1' }
            ]);
        });

        it('returns only the column task operation if no assigned members exist', () => {
            const operations = taskService.getTaskRefsToDelete('p1', 'c1', 't1', []);

            expect(operations).toHaveLength(1);
            expect(operations[0]).toEqual({ type: 'delete', ref: 'projects/p1/columns/c1/tasks/t1' });
        });
    });

    describe('deleteTask', () => {
        it('executes batchOps with the operations returned by getTaskRefsToDelete', async () => {
            // Because getTaskRefsToDelete is tested above, we just ensure batchOps is called with its output
            await taskService.deleteTask('p1', 'c1', 't1', [{ id: 'u1' }]);

            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                { type: 'delete', ref: 'projects/p1/columns/c1/tasks/t1' },
                { type: 'delete', ref: 'users/u1/tasks/t1' }
            ]);
        });
    });

    describe('reorderColumnTasks', () => {
        it('calculates the affected slice and generates UPDATE operations for top-down move', async () => {
            const tasks = [
                { id: 't0' }, // index 0
                { id: 't1' }, // index 1
                { id: 't2' }, // index 2
                { id: 't3' }, // index 3
                { id: 't4' }  // index 4
            ];
            
            // Moved a task from index 1 to index 3
            await taskService.reorderColumnTasks('p1', 'c1', tasks, 1, 3);

            // start = 1, end = 3. 
            // Affected slice: t1(1), t2(2), t3(3).
            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t1', data: { order: 1 } },
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t2', data: { order: 2 } },
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t3', data: { order: 3 } }
            ]);
        });

        it('calculates the affected slice and generates UPDATE operations for bottom-up move', async () => {
            const tasks = [{ id: 't0' }, { id: 't1' }, { id: 't2' }];
            
            // Moved a task from index 2 to index 0
            await taskService.reorderColumnTasks('p1', 'c1', tasks, 2, 0);

            // start = 0, end = 2.
            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t0', data: { order: 0 } },
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t1', data: { order: 1 } },
                { type: 'update', ref: 'projects/p1/columns/c1/tasks/t2', data: { order: 2 } }
            ]);
        });
    });

    describe('moveTaskToColumn', () => {
        it('generates DELETE, SET, and UPDATE operations across columns and user subcollections', async () => {
            mockGetCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 42 }) });

            const task = {
                id: 't1',
                name: 'Move Me',
                description: 'A task',
                label: 'Bug',
                createdAt: 'timestamp-123',
                assignedMembers: [{ id: 'u1' }]
            };
            const toColumn = { id: 'c2', name: 'Done' };

            await taskService.moveTaskToColumn('p1', task, 'c1', toColumn);

            expect(mockGetCountFromServer).toHaveBeenCalledWith('projects/p1/columns/c2/tasks');

            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                // 1. Delete from old
                { type: 'delete', ref: 'projects/p1/columns/c1/tasks/t1' },
                // 2. Set in new
                {
                    type: 'set', 
                    ref: 'projects/p1/columns/c2/tasks/t1',
                    data: {
                        name: 'Move Me',
                        description: 'A task',
                        label: 'Bug',
                        assignedMembers: [{ id: 'u1' }],
                        order: 42,
                        createdAt: 'timestamp-123'
                    }
                },
                // 3. Update user
                {
                    type: 'update',
                    ref: 'users/u1/tasks/t1',
                    data: { columnId: 'c2', columnName: 'Done' }
                }
            ]);
        });

        it('handles move safely if assignedMembers is null/undefined', async () => {
            mockGetCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 1 }) });

            const task = { id: 't1', name: 'Move Me', assignedMembers: undefined }; // undefined members
            const toColumn = { id: 'c2', name: 'Done' };

            await taskService.moveTaskToColumn('p1', task, 'c1', toColumn);

            // batchOps array should only have length 2 (Delete and Set). No Update (since no users)
            const operationsPassedToBatch = batchOps.mock.calls[0][1];
            expect(operationsPassedToBatch).toHaveLength(2);
        });
    });

    describe('updateTask', () => {
        it('normalizes task data and generates UPDATE operations for column and assigned members', async () => {
            const taskData = {
                name: '  Updated Task  ',
                description: '  New Description  ',
                label: ' Bug ',
                assignedMembers: [{ id: 'u1' }, { id: 'u2' }]
            };

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                // 1. Update task in column
                {
                    type: 'update',
                    ref: 'projects/p1/columns/c1/tasks/t1',
                    data: {
                        name: 'Updated Task',
                        description: 'New Description',
                        label: 'Bug',
                        assignedMembers: [{ id: 'u1' }, { id: 'u2' }]
                    }
                },
                // 2. Update task for each assigned member
                {
                    type: 'update',
                    ref: 'users/u1/tasks/t1',
                    data: {
                        name: 'Updated Task',
                        description: 'New Description',
                        label: 'Bug',
                        assignedMembers: [{ id: 'u1' }, { id: 'u2' }]
                    }
                },
                {
                    type: 'update',
                    ref: 'users/u2/tasks/t1',
                    data: {
                        name: 'Updated Task',
                        description: 'New Description',
                        label: 'Bug',
                        assignedMembers: [{ id: 'u1' }, { id: 'u2' }]
                    }
                }
            ]);
        });

        it('handles update with empty assigned members array', async () => {
            const taskData = {
                name: 'Updated Task',
                description: 'New Description',
                label: 'Idea',
                assignedMembers: []
            };

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            // Should only have the column update, no user updates
            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                {
                    type: 'update',
                    ref: 'projects/p1/columns/c1/tasks/t1',
                    data: {
                        name: 'Updated Task',
                        description: 'New Description',
                        label: 'Idea',
                        assignedMembers: []
                    }
                }
            ]);
        });

        it('handles update with null/undefined assigned members', async () => {
            const taskData = {
                name: 'Updated Task',
                description: 'Description',
                label: 'Work'
            };
            // assignedMembers is undefined

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            // Should only have the column update
            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                {
                    type: 'update',
                    ref: 'projects/p1/columns/c1/tasks/t1',
                    data: {
                        name: 'Updated Task',
                        description: 'Description',
                        label: 'Work',
                        assignedMembers: []
                    }
                }
            ]);
        });

        it('trims whitespace from task fields', async () => {
            const taskData = {
                name: '   Task with spaces   ',
                description: '   Description with spaces   ',
                label: '   Urgent   ',
                assignedMembers: [{ id: 'u1' }]
            };

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            const expectedNormalizedData = {
                name: 'Task with spaces',
                description: 'Description with spaces',
                label: 'Urgent',
                assignedMembers: [{ id: 'u1' }]
            };

            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', [
                {
                    type: 'update',
                    ref: 'projects/p1/columns/c1/tasks/t1',
                    data: expectedNormalizedData
                },
                {
                    type: 'update',
                    ref: 'users/u1/tasks/t1',
                    data: expectedNormalizedData
                }
            ]);
        });

        it('handles update with multiple assigned members', async () => {
            const taskData = {
                name: 'Multi-member Task',
                description: 'Shared task',
                label: 'Feature',
                assignedMembers: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]
            };

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            // Should have 1 column update + 3 user updates = 4 total operations
            expect(batchOps.mock.calls[0][1]).toHaveLength(4);

            // Verify all user updates are present
            const operations = batchOps.mock.calls[0][1];
            const userUpdates = operations.filter(op => op.ref.includes('users/'));
            expect(userUpdates).toHaveLength(3);
            expect(userUpdates[0].ref).toContain('users/u1/tasks/t1');
            expect(userUpdates[1].ref).toContain('users/u2/tasks/t1');
            expect(userUpdates[2].ref).toContain('users/u3/tasks/t1');
        });

        it('calls batchOps with correct database instance', async () => {
            const taskData = {
                name: 'Task',
                description: 'Desc',
                label: 'Bug',
                assignedMembers: []
            };

            await taskService.updateTask('p1', 'c1', 't1', taskData);

            expect(batchOps).toHaveBeenCalledWith('mocked-db-instance', expect.any(Array));
        });
    });
});