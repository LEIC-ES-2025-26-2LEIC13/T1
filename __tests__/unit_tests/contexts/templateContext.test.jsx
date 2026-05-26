import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React, { useContext } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { TemplateContext, TemplateProvider } from '../../../contexts/templateContext';
import { templateService } from '../../../api/templateService';
import { templateColumnService } from '../../../api/templateColumnService';
import { useAuth } from '../../../hooks/useAuth';

jest.mock('../../../api/templateService', () => ({
    templateService: {
        subscribeToAllTemplates: jest.fn(),
        createTemplate: jest.fn(),
        updateTemplate: jest.fn(),
        deleteTemplate: jest.fn(),
        reorderTemplates: jest.fn(),
    }
}));

jest.mock('../../../api/templateColumnService', () => ({
    templateColumnService: {
        subscribeToTemplateColumns: jest.fn(),
        createColumn: jest.fn(),
        updateColumn: jest.fn(),
        deleteColumn: jest.fn(),
    }
}));

jest.mock('../../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}));

describe('TemplateContext', () => {
    let wrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        wrapper = ({ children }) => <TemplateProvider>{children}</TemplateProvider>;
    });

    it('should initialize with default values for non-admins', () => {
        useAuth.mockReturnValue({ isAdmin: false });
        const { result } = renderHook(() => useContext(TemplateContext), { wrapper });

        expect(result.current.templates).toEqual([]);
        expect(result.current.isLoadingTemplates).toBe(false);
        expect(result.current.columns).toEqual([]);
        expect(result.current.isLoadingColumns).toBe(false);
        expect(templateService.subscribeToAllTemplates).not.toHaveBeenCalled();
    });

    it('should subscribe to templates for admins and cleanup on unmount', () => {
        useAuth.mockReturnValue({ isAdmin: true });
        const unsubscribe = jest.fn();
        templateService.subscribeToAllTemplates.mockImplementation((cb) => {
            cb([{ id: 't1' }]);
            return unsubscribe;
        });

        const { result, unmount } = renderHook(() => useContext(TemplateContext), { wrapper });

        expect(templateService.subscribeToAllTemplates).toHaveBeenCalledWith(expect.any(Function));
        expect(result.current.templates).toEqual([{ id: 't1' }]);
        expect(result.current.isLoadingTemplates).toBe(false);

        unmount();
        expect(unsubscribe).toHaveBeenCalled();
    });

    it('should handle template column subscription lifecycle', async () => {
        useAuth.mockReturnValue({ isAdmin: true });
        const unsubscribe = jest.fn();
        templateColumnService.subscribeToTemplateColumns.mockImplementation((id, cb) => {
            cb([{ id: 'c1', name: 'Todo' }]);
            return unsubscribe;
        });

        const { result } = renderHook(() => useContext(TemplateContext), { wrapper });

        await act(() => result.current.setActiveTemplateId('t1'));
        expect(templateColumnService.subscribeToTemplateColumns).toHaveBeenCalledWith('t1', expect.any(Function));
        expect(result.current.columns).toEqual([{ id: 'c1', name: 'Todo' }]);
        expect(result.current.isLoadingColumns).toBe(false);

        await act(() => result.current.setActiveTemplateId(''));
        expect(result.current.columns).toEqual([]);
    });

    describe('Template actions (admin)', () => {
        let currentResult;

        beforeEach(() => {
            useAuth.mockReturnValue({ isAdmin: true });
            templateService.subscribeToAllTemplates.mockImplementation(() => jest.fn());
            const { result } = renderHook(() => useContext(TemplateContext), { wrapper });
            currentResult = result;
        });

        it('should call createTemplate API', async () => {
            const templateData = { title: 'New Template' };
            await act(async () => {
                await currentResult.current.createTemplate(templateData);
            });
            expect(templateService.createTemplate).toHaveBeenCalledWith(templateData);
        });

        it('should call updateTemplate API', async () => {
            await act(async () => {
                await currentResult.current.updateTemplate('t1', { title: 'Updated' });
            });
            expect(templateService.updateTemplate).toHaveBeenCalledWith('t1', { title: 'Updated' });
        });

        it('should call deleteTemplate API', async () => {
            await act(async () => {
                await currentResult.current.deleteTemplate('t1');
            });
            expect(templateService.deleteTemplate).toHaveBeenCalledWith('t1');
        });

        it('should call reorderTemplates API', async () => {
            const reordered = [{ id: 't2' }, { id: 't1' }];
            await act(async () => {
                await currentResult.current.reorderTemplates(reordered);
            });
            expect(templateService.reorderTemplates).toHaveBeenCalledWith(reordered);
        });
    });

    describe('Template actions (non-admin)', () => {
        let currentResult;

        beforeEach(() => {
            useAuth.mockReturnValue({ isAdmin: false });
            const { result } = renderHook(() => useContext(TemplateContext), { wrapper });
            currentResult = result;
        });

        it('should throw on createTemplate', async () => {
            await expect(currentResult.current.createTemplate({ title: 'New' }))
                .rejects
                .toThrow('Only administrators can create templates');
        });

        it('should throw on updateTemplate', async () => {
            await expect(currentResult.current.updateTemplate('t1', { title: 'Updated' }))
                .rejects
                .toThrow('Only administrators can update templates');
        });

        it('should throw on deleteTemplate', async () => {
            await expect(currentResult.current.deleteTemplate('t1'))
                .rejects
                .toThrow('Only administrators can delete templates');
        });

        it('should throw on reorderTemplates', async () => {
            await expect(currentResult.current.reorderTemplates([{ id: 't1' }]))
                .rejects
                .toThrow('Only administrators can reorder templates');
        });
    });

    describe('Template column actions', () => {
        let currentResult;

        beforeEach(async () => {
            useAuth.mockReturnValue({ isAdmin: true });
            const { result } = renderHook(() => useContext(TemplateContext), { wrapper });
            currentResult = result;
            await act(() => currentResult.current.setActiveTemplateId('t1'));
        });

        it('should call createColumn API', async () => {
            await act(async () => {
                await currentResult.current.createColumn({ name: 'Column' });
            });
            expect(templateColumnService.createColumn).toHaveBeenCalledWith('t1', { name: 'Column' });
        });

        it('should call updateColumn API', async () => {
            await act(async () => {
                await currentResult.current.updateColumn('c1', { name: 'Updated' });
            });
            expect(templateColumnService.updateColumn).toHaveBeenCalledWith('t1', 'c1', { name: 'Updated' });
        });

        it('should call deleteColumn API', async () => {
            await act(async () => {
                await currentResult.current.deleteColumn('c1');
            });
            expect(templateColumnService.deleteColumn).toHaveBeenCalledWith('t1', 'c1');
        });
    });
});
