import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { columnService } from '../../../api/columnService';
import { getDocs, orderBy, onSnapshot, runTransaction } from 'firebase/firestore';
import { batchOps, OPERATION_TYPES } from '../../../api/batchOpsHelper';
import { pathHelper } from '../../../api/pathHelper';
import { taskService } from '../../../api/taskService';

// Mocks 

jest.mock('firebase/firestore', () => ({
    doc:            jest.fn(),
    getDocs:        jest.fn(),
    query:          jest.fn(ref => ref),
    orderBy:        jest.fn(),
    onSnapshot:     jest.fn(),
    runTransaction: jest.fn(),
    Timestamp:      { now: jest.fn(() => 'mocked-timestamp') },
}));

jest.mock('../../../api/batchOpsHelper', () => ({
    batchOps:        jest.fn().mockResolvedValue(undefined),
    OPERATION_TYPES: { DELETE: 'DELETE', UPDATE: 'UPDATE', SET: 'SET' },
}));

jest.mock('../../../api/pathHelper', () => ({
    pathHelper: {
        projectColumns: jest.fn(),
        projectColumn:  jest.fn(),
        project:        jest.fn(),
        columnTasks:    jest.fn(),
        userTask:       jest.fn(),
    },
}));

jest.mock('../../../api/taskService', () => ({
    taskService: {
        getTaskRefsToDelete: jest.fn(),
    },
}));

jest.mock('../../../firebase/firebaseConfig', () => ({ db: {} }));

// Helpers

function makeSnapshot(docs) {
    return {
        docs,
        forEach: (cb) => docs.forEach(cb),
    };
}

function makeTaskDoc(id, assignedMembers = []) {
    return {
        id,
        ref: { id },
        data: () => ({ assignedMembers }),
    };
}

// Tests 

describe('columnService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        batchOps.mockResolvedValue(undefined);
    });

    // subscribeToProjectColumns

    describe('subscribeToProjectColumns', () => {
        it('calls onUpdate with mapped columns from snapshot', () => {
            const onUpdate = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb(makeSnapshot([
                    { id: 'c1', data: () => ({ name: 'Todo',       order: 1 }) },
                    { id: 'c2', data: () => ({ name: 'In Progress', order: 2 }) },
                ]));
                return jest.fn();
            });

            columnService.subscribeToProjectColumns('p1', onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([
                { id: 'c1', name: 'Todo',        order: 1 },
                { id: 'c2', name: 'In Progress',  order: 2 },
            ]);
        });

        it('calls onUpdate with an empty array when there are no columns', () => {
            const onUpdate = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb(makeSnapshot([]));
                return jest.fn();
            });

            columnService.subscribeToProjectColumns('p1', onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([]);
        });

        it('returns the unsubscribe function returned by onSnapshot', () => {
            const unsub = jest.fn();
            onSnapshot.mockReturnValue(unsub);

            const result = columnService.subscribeToProjectColumns('p1', jest.fn());

            expect(result).toBe(unsub);
        });

        it('queries columns ordered by order ascending', () => {
            onSnapshot.mockReturnValue(jest.fn());
            const colsRef = { _type: 'colsRef' };
            pathHelper.projectColumns.mockReturnValue(colsRef);

            columnService.subscribeToProjectColumns('p1', jest.fn());

            expect(pathHelper.projectColumns).toHaveBeenCalledWith('p1');
            expect(orderBy).toHaveBeenCalledWith('order', 'asc');
        });
    });

    // createColumn

    describe('createColumn', () => {
        it('throws when projectId is missing', async () => {
            await expect(columnService.createColumn(null, { name: 'Col' }))
                .rejects.toThrow('Project ID is required to create a column');
        });

        it('throws when projectId is an empty string', async () => {
            await expect(columnService.createColumn('', { name: 'Col' }))
                .rejects.toThrow('Project ID is required to create a column');
        });

        it('runs a transaction when projectId and name are valid', async () => {
            runTransaction.mockImplementation(async (_db, cb) => {
                await cb({
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 2 }) }),
                    update: jest.fn(),
                    set:    jest.fn(),
                });
            });

            await columnService.createColumn('p1', { name: 'Sprint 1' });

            expect(runTransaction).toHaveBeenCalledTimes(1);
        });

        it('uses columnCount + 1 as the order for the new column', async () => {
            let capturedSet;
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 4 }) }),
                    update: jest.fn(),
                    set:    jest.fn((_ref, data) => { capturedSet = data; }),
                };
                await cb(txn);
            });

            await columnService.createColumn('p1', { name: 'Sprint 1' });

            expect(capturedSet.order).toBe(5);
        });

        it('increments columnCount on the project document', async () => {
            let capturedUpdate;
            const projectRef = { _type: 'projectRef' };
            pathHelper.project.mockReturnValue(projectRef);

            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 2 }) }),
                    update: jest.fn((_ref, data) => { capturedUpdate = data; }),
                    set:    jest.fn(),
                };
                await cb(txn);
            });

            await columnService.createColumn('p1', { name: 'Col' });

            expect(capturedUpdate).toEqual({ columnCount: 3 });
        });

        it('trims whitespace from the column name', async () => {
            let capturedSet;
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 0 }) }),
                    update: jest.fn(),
                    set:    jest.fn((_ref, data) => { capturedSet = data; }),
                };
                await cb(txn);
            });

            await columnService.createColumn('p1', { name: '  Trimmed  ' });

            expect(capturedSet.name).toBe('Trimmed');
        });

        it('stores an empty string when name is null', async () => {
            let capturedSet;
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 0 }) }),
                    update: jest.fn(),
                    set:    jest.fn((_ref, data) => { capturedSet = data; }),
                };
                await cb(txn);
            });

            await columnService.createColumn('p1', { name: null });

            expect(capturedSet.name).toBe('');
        });

        it('sets createdAt to Timestamp.now()', async () => {
            let capturedSet;
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get:    jest.fn().mockResolvedValue({ data: () => ({ columnCount: 0 }) }),
                    update: jest.fn(),
                    set:    jest.fn((_ref, data) => { capturedSet = data; }),
                };
                await cb(txn);
            });

            await columnService.createColumn('p1', { name: 'Col' });

            expect(capturedSet.createdAt).toBe('mocked-timestamp');
        });
    });

    // deleteColumn

    describe('deleteColumn', () => {
        it('calls batchOps with the column ref as a delete operation', async () => {
            const columnRef = { _type: 'columnRef' };
            pathHelper.projectColumn.mockReturnValue(columnRef);
            pathHelper.columnTasks.mockReturnValue('columnTasksRef');
            getDocs.mockResolvedValue(makeSnapshot([]));

            await columnService.deleteColumn('p1', 'c1');

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([{ type: OPERATION_TYPES.DELETE, ref: columnRef }])
            );
        });

        it('collects task delete ops for each task in the column', async () => {
            const taskOps = [{ type: 'delete', ref: 'taskRef' }];
            taskService.getTaskRefsToDelete.mockReturnValue(taskOps);
            pathHelper.columnTasks.mockReturnValue('columnTasksRef');
            pathHelper.projectColumn.mockReturnValue('columnRef');

            const taskDoc = makeTaskDoc('t1', [{ id: 'u1' }]);
            getDocs.mockResolvedValue(makeSnapshot([taskDoc]));

            await columnService.deleteColumn('p1', 'c1');

            expect(taskService.getTaskRefsToDelete).toHaveBeenCalledWith('p1', 'c1', 't1', [{ id: 'u1' }]);
            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining(taskOps)
            );
        });

        it('executes batchOps even when the column has no tasks', async () => {
            getDocs.mockResolvedValue(makeSnapshot([]));
            pathHelper.projectColumn.mockReturnValue('columnRef');

            await columnService.deleteColumn('p1', 'c1');

            expect(batchOps).toHaveBeenCalledTimes(1);
        });

        it('defaults assignedMembers to [] when missing from task data', async () => {
            taskService.getTaskRefsToDelete.mockReturnValue([]);
            getDocs.mockResolvedValue(makeSnapshot([
                { id: 't1', data: () => ({}) }, // no assignedMembers field
            ]));
            pathHelper.projectColumn.mockReturnValue('columnRef');

            await columnService.deleteColumn('p1', 'c1');

            expect(taskService.getTaskRefsToDelete).toHaveBeenCalledWith('p1', 'c1', 't1', []);
        });

        it("should default assignedMembers to [] when the field is missing on a task during deleteColumn", async () => {
            getDocs.mockResolvedValueOnce({
                forEach: (cb) => cb({
                    id: "t1",
                    data: () => ({ /* no assignedMembers field */ }),
                    ref: "taskRef"
                })
            })
            taskService.getTaskRefsToDelete.mockReturnValue([])

            await columnService.deleteColumn("p1", "c1")

            // getTaskRefsToDelete must have been called with an empty array, confirming || [] fired
            expect(taskService.getTaskRefsToDelete).toHaveBeenCalledWith("p1", "c1", "t1", [])
        })
    });

    // allColumnsRefsToDelete 

    describe('allColumnsRefsToDelete', () => {
        it('returns an empty array when the project has no columns', async () => {
            getDocs.mockResolvedValue(makeSnapshot([]));

            const result = await columnService.allColumnsRefsToDelete('p1');

            expect(result).toEqual([]);
        });

        it('includes a delete op for each column', async () => {
            const colRef1 = { _type: 'colRef1' };
            const colRef2 = { _type: 'colRef2' };

            getDocs
                .mockResolvedValueOnce(makeSnapshot([
                    { id: 'c1', ref: colRef1, data: () => ({}) },
                    { id: 'c2', ref: colRef2, data: () => ({}) },
                ]))
                .mockResolvedValue(makeSnapshot([])); // no tasks in either column

            const result = await columnService.allColumnsRefsToDelete('p1');

            expect(result).toEqual(expect.arrayContaining([
                { type: OPERATION_TYPES.DELETE, ref: colRef1 },
                { type: OPERATION_TYPES.DELETE, ref: colRef2 },
            ]));
        });

        it('includes task delete ops for tasks within each column', async () => {
            const taskOps = [{ type: 'delete', ref: 'taskRef' }];
            taskService.getTaskRefsToDelete.mockReturnValue(taskOps);

            getDocs
                .mockResolvedValueOnce(makeSnapshot([
                    { id: 'c1', ref: 'colRef1', data: () => ({}) },
                ]))
                .mockResolvedValueOnce(makeSnapshot([
                    makeTaskDoc('t1', [{ id: 'u1' }]),
                ]));

            const result = await columnService.allColumnsRefsToDelete('p1');

            expect(result).toEqual(expect.arrayContaining(taskOps));
        });

        it('defaults assignedMembers to [] when missing from task data', async () => {
            taskService.getTaskRefsToDelete.mockReturnValue([]);

            getDocs
                .mockResolvedValueOnce(makeSnapshot([
                    { id: 'c1', ref: 'colRef1', data: () => ({}) },
                ]))
                .mockResolvedValueOnce(makeSnapshot([
                    { id: 't1', data: () => ({}) },
                ]));

            await columnService.allColumnsRefsToDelete('p1');

            expect(taskService.getTaskRefsToDelete).toHaveBeenCalledWith('p1', 'c1', 't1', []);
        });
    });

    // updateColumn 

    describe('updateColumn', () => {
        it('throws when name is an empty string', async () => {
            await expect(columnService.updateColumn('p1', 'c1', { name: ' ' }))
                .rejects.toThrow('Column name cannot be empty');
        });

        it('throws when name is null', async () => {
            await expect(columnService.updateColumn('p1', 'c1', { name: null }))
                .rejects.toThrow('Column name cannot be empty');
        });

        it('returns early without calling batchOps when updates object has no name key', async () => {
            await columnService.updateColumn('p1', 'c1', {});
            expect(batchOps).not.toHaveBeenCalled();
        });

        it('updates the column document with the trimmed name', async () => {
            const columnRef = { _type: 'columnRef' };
            pathHelper.projectColumn.mockReturnValue(columnRef);
            getDocs.mockResolvedValue(makeSnapshot([]));

            await columnService.updateColumn('p1', 'c1', { name: '  Done  ' });

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([{
                    type: OPERATION_TYPES.UPDATE,
                    ref:  columnRef,
                    data: { name: 'Done' },
                }])
            );
        });

        it('cascades the new columnName to every user-task document', async () => {
            pathHelper.projectColumn.mockReturnValue('columnRef');
            const userTaskRef = { _type: 'userTaskRef' };
            pathHelper.userTask.mockReturnValue(userTaskRef);

            getDocs.mockResolvedValue(makeSnapshot([
                makeTaskDoc('t1', [{ id: 'u1' }, { id: 'u2' }]),
            ]));

            await columnService.updateColumn('p1', 'c1', { name: 'Review' });

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    { type: OPERATION_TYPES.UPDATE, ref: userTaskRef, data: { columnName: 'Review' } },
                    { type: OPERATION_TYPES.UPDATE, ref: userTaskRef, data: { columnName: 'Review' } },
                ])
            );
        });

        it('does not cascade when a task has no assigned members', async () => {
            pathHelper.projectColumn.mockReturnValue('columnRef');
            getDocs.mockResolvedValue(makeSnapshot([
                makeTaskDoc('t1', []),
            ]));

            await columnService.updateColumn('p1', 'c1', { name: 'Review' });

            // Only the column update op, no user-task ops
            const [, ops] = batchOps.mock.calls[0];
            expect(ops).toHaveLength(1);
        });

        it('calls batchOps once per updateColumn call', async () => {
            pathHelper.projectColumn.mockReturnValue('columnRef');
            getDocs.mockResolvedValue(makeSnapshot([]));

            await columnService.updateColumn('p1', 'c1', { name: 'New Name' });

            expect(batchOps).toHaveBeenCalledTimes(1);
        });

        it("should default assignedMembers to [] when the field is missing on a task during updateColumn", async () => {
            getDocs.mockResolvedValueOnce({
                forEach: (cb) => cb({
                    id: "t1",
                    data: () => ({ /* no assignedMembers field */ })
                })
            })

            await columnService.updateColumn("p1", "c1", { name: "New Name" })

            // No UPDATE ops for user tasks should have been pushed — empty members = no iterations
            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    expect.objectContaining({ type: "UPDATE", data: { name: "New Name" } }) // column update only
                ])
            )
            // Confirm no userTask update was queued (would require pathHelper.userTask to be called)
            expect(pathHelper.userTask).not.toHaveBeenCalled()
        })
    });
});
