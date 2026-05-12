import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { writeBatch } from 'firebase/firestore';
import { batchOps, OPERATION_TYPES } from '../../../api/batchOpsHelper';

jest.mock('firebase/firestore', () => ({
    writeBatch: jest.fn(),
}));

// Helpers

const mockDb = {};

function makeBatchMock() {
    const batchMock = {
        delete: jest.fn(),
        update: jest.fn(),
        set:    jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
    };
    writeBatch.mockReturnValue(batchMock);
    return batchMock;
}

function makeOps(type, count) {
    return Array.from({ length: count }, (_, i) => ({
        type,
        ref:  { id: i },
        data: { value: i },
    }));
}

// Tests

describe('batchOps', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Batching logic

    it('creates a single batch when operations are fewer than 450', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 100));
        expect(writeBatch).toHaveBeenCalledTimes(1);
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    it('creates a single batch for exactly 450 operations', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 450));
        expect(writeBatch).toHaveBeenCalledTimes(1);
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    it('creates two batches when operations exceed 450', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 500));
        expect(writeBatch).toHaveBeenCalledTimes(2);
        expect(batch.commit).toHaveBeenCalledTimes(2);
    });

    it('creates three batches for 900 operations', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 900));
        expect(writeBatch).toHaveBeenCalledTimes(2);
        expect(batch.commit).toHaveBeenCalledTimes(2);
    });

    it('creates three batches for 901 operations', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 901));
        expect(writeBatch).toHaveBeenCalledTimes(3);
        expect(batch.commit).toHaveBeenCalledTimes(3);
    });

    it('does nothing when operations array is empty', async () => {
        makeBatchMock();
        await batchOps(mockDb, []);
        expect(writeBatch).not.toHaveBeenCalled();
    });

    it('passes db to every writeBatch call', async () => {
        makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 500));
        expect(writeBatch).toHaveBeenNthCalledWith(1, mockDb);
        expect(writeBatch).toHaveBeenNthCalledWith(2, mockDb);
    });

    // Operation types

    it('calls batch.delete for each delete operation', async () => {
        const batch = makeBatchMock();
        const ops = makeOps(OPERATION_TYPES.DELETE, 3);
        await batchOps(mockDb, ops);
        expect(batch.delete).toHaveBeenCalledTimes(3);
        ops.forEach(op => expect(batch.delete).toHaveBeenCalledWith(op.ref));
    });

    it('calls batch.update with ref and data for each update operation', async () => {
        const batch = makeBatchMock();
        const ops = makeOps(OPERATION_TYPES.UPDATE, 3);
        await batchOps(mockDb, ops);
        expect(batch.update).toHaveBeenCalledTimes(3);
        ops.forEach(op => expect(batch.update).toHaveBeenCalledWith(op.ref, op.data));
    });

    it('calls batch.set with ref and data for each set operation', async () => {
        const batch = makeBatchMock();
        const ops = makeOps(OPERATION_TYPES.SET, 3);
        await batchOps(mockDb, ops);
        expect(batch.set).toHaveBeenCalledTimes(3);
        ops.forEach(op => expect(batch.set).toHaveBeenCalledWith(op.ref, op.data));
    });

    it('ignores operations with an unrecognised type', async () => {
        const batch = makeBatchMock();
        const ops = [{ type: 'unknown', ref: { id: 0 }, data: {} }];
        await batchOps(mockDb, ops);
        expect(batch.delete).not.toHaveBeenCalled();
        expect(batch.update).not.toHaveBeenCalled();
        expect(batch.set).not.toHaveBeenCalled();
        expect(batch.commit).toHaveBeenCalledTimes(1); // batch still committed
    });

    it('handles mixed operation types in a single batch', async () => {
        const batch = makeBatchMock();
        const ops = [
            { type: OPERATION_TYPES.DELETE, ref: { id: 0 }, data: undefined },
            { type: OPERATION_TYPES.UPDATE, ref: { id: 1 }, data: { x: 1 } },
            { type: OPERATION_TYPES.SET,    ref: { id: 2 }, data: { y: 2 } },
        ];
        await batchOps(mockDb, ops);
        expect(batch.delete).toHaveBeenCalledTimes(1);
        expect(batch.update).toHaveBeenCalledTimes(1);
        expect(batch.set).toHaveBeenCalledTimes(1);
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    // Total operation count across batches

    it('executes all 500 delete operations across two batches', async () => {
        const batch = makeBatchMock();
        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 500));
        expect(batch.delete).toHaveBeenCalledTimes(500);
    });

    it('commits each batch before starting the next', async () => {
        const callOrder = [];
        const batch = {
            delete: jest.fn(),
            update: jest.fn(),
            set:    jest.fn(),
            commit: jest.fn().mockImplementation(() => {
                callOrder.push('commit');
                return Promise.resolve();
            }),
        };
        writeBatch.mockImplementation(() => {
            callOrder.push('writeBatch');
            return batch;
        });

        await batchOps(mockDb, makeOps(OPERATION_TYPES.DELETE, 500));

        expect(callOrder).toEqual(['writeBatch', 'commit', 'writeBatch', 'commit']);
    });
});

// OPERATION_TYPES constant

describe('OPERATION_TYPES', () => {
    it('has the correct value for DELETE', () => {
        expect(OPERATION_TYPES.DELETE).toBe('delete');
    });

    it('has the correct value for UPDATE', () => {
        expect(OPERATION_TYPES.UPDATE).toBe('update');
    });

    it('has the correct value for SET', () => {
        expect(OPERATION_TYPES.SET).toBe('set');
    });
});
