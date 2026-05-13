import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import Tasks from '../../app/(home)/(drawer)/tasks';
import { taskService } from '../../api/taskService';
import { useAuth } from '../../hooks/useAuth';

// Fix ESM errors
jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));
jest.mock('../../firebase/firebaseConfig', () => ({}));

// Mock dependencies
jest.mock('../../api/taskService', () => ({
    taskService: {
        subscribeToUserTasks: jest.fn(),
        deleteTask: jest.fn(),
    }
}));

jest.mock('../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}));

// Mock child components
jest.mock('../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children }) => <View>{children}</View>;
});

jest.mock('../../components/EmptyState', () => {
    const { View } = require('react-native');
    return () => <View testID="empty-state" />;
});

jest.mock('../../components/ThemedTask', () => {
    const { Pressable } = require('react-native');
    return ({ task, onPress }) => (
        <Pressable testID={`task-${task.id}`} onPress={onPress} accessible />
    );
});

jest.mock('../../components/TaskModal', () => {
    const { Pressable } = require('react-native');
    return (props) => {
        if (!props.visible) return null;
        return (
            <Pressable
                testID="task-modal"
                accessibilityHint="delete"
                onPress={() => props.deleteTask(props.task)}
            />
        );
    };
});

// Export ALERT_TYPES alongside the default mock so the component's import resolves correctly
jest.mock('../../components/ThemedAlert', () => {
    const { Pressable } = require('react-native');
    return {
        __esModule: true,
        default: ({ visible, alert, onConfirm }) => {
            if (!visible) return null;
            return (
                <Pressable
                    testID="alert"
                    onPress={onConfirm}
                    accessibilityLabel={alert.title}
                    accessibilityHint={alert.message}
                />
            );
        },
        ALERT_TYPES: { ERROR: 'error', SUCCESS: 'success', WARNING: 'warning' },
    };
});

jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children, style }) => <Text style={style}>{children}</Text>;
});
jest.mock('../../components/Divider', () => () => null);
jest.mock('../../components/Spacer',  () => () => null);

// Helpers

const MOCK_USER = { uid: 'user-1', email: 'user@test.com' };

const makeTasks = () => [
    { id: 't1', projectId: 'p1', projectName: 'Alpha', columnId: 'c1', columnName: 'To Do',       assignedMembers: ['user-1'], title: 'Task 1' },
    { id: 't2', projectId: 'p1', projectName: 'Alpha', columnId: 'c1', columnName: 'To Do',       assignedMembers: ['user-1'], title: 'Task 2' },
    { id: 't3', projectId: 'p2', projectName: 'Beta',  columnId: 'c2', columnName: 'In Progress', assignedMembers: ['user-1'], title: 'Task 3' },
];

function setupSubscription(tasks = []) {
    let capturedCallback;
    taskService.subscribeToUserTasks.mockImplementation((_uid, cb) => {
        capturedCallback = cb;
        cb(tasks);
        return jest.fn();
    });
    return { emit: (t) => act(() => capturedCallback(t)) };
}

// Tests

describe('Tasks integration testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: MOCK_USER });
        taskService.deleteTask.mockReset();
    });

    // Real-time updates

    it('re-renders the list when the subscription emits new tasks', async () => {
        const { emit } = setupSubscription([]);
        render(<Tasks />);

        expect(screen.getByTestId('empty-state')).toBeTruthy();

        emit(makeTasks());

        await waitFor(() => expect(screen.queryByTestId('empty-state')).toBeNull());
        expect(screen.getByTestId('task-t1')).toBeTruthy();
        expect(screen.getByTestId('task-t2')).toBeTruthy();
        expect(screen.getByTestId('task-t3')).toBeTruthy();
    });

    it('removes tasks from the list when the subscription emits an empty array', async () => {
        const { emit } = setupSubscription(makeTasks());
        render(<Tasks />);

        expect(screen.getByTestId('task-t1')).toBeTruthy();

        emit([]);

        await waitFor(() => expect(screen.queryByTestId('task-t1')).toBeNull());
        expect(screen.getByTestId('empty-state')).toBeTruthy();
    });

    // Delete — success

    it('calls taskService.deleteTask with the correct arguments', async () => {
        taskService.deleteTask.mockResolvedValue(undefined);
        setupSubscription(makeTasks());

        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));

        await waitFor(() => expect(screen.getByTestId('task-modal')).toBeTruthy());

        await act(async () => {
            fireEvent.press(screen.getByTestId('task-modal'));
        });

        expect(taskService.deleteTask).toHaveBeenCalledWith('p1', 'c1', 't1', ['user-1']);
    });

    it('closes the modal after a successful delete', async () => {
        taskService.deleteTask.mockResolvedValue(undefined);
        setupSubscription(makeTasks());

        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));

        await waitFor(() => expect(screen.getByTestId('task-modal')).toBeTruthy());

        await act(async () => {
            fireEvent.press(screen.getByTestId('task-modal'));
        });

        await waitFor(() => expect(screen.queryByTestId('task-modal')).toBeNull());
    });

    // Delete — failure 

    it('shows ThemedAlert when deleteTask throws', async () => {
        taskService.deleteTask.mockRejectedValue(new Error('Network error'));
        setupSubscription(makeTasks());

        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));

        await waitFor(() => expect(screen.getByTestId('task-modal')).toBeTruthy());

        await act(async () => {
            fireEvent.press(screen.getByTestId('task-modal'));
        });

        await waitFor(() => {
            const alert = screen.getByTestId('alert');
            expect(alert.props.accessibilityLabel).toBe('Delete Task Failed');
            expect(alert.props.accessibilityHint).toBe('Network error');
        });
    });

    it('keeps the modal open when deleteTask throws', async () => {
        taskService.deleteTask.mockRejectedValue(new Error('fail'));
        setupSubscription(makeTasks());

        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));

        await waitFor(() => expect(screen.getByTestId('task-modal')).toBeTruthy());

        await act(async () => {
            fireEvent.press(screen.getByTestId('task-modal'));
        });

        await waitFor(() => screen.getByTestId('alert'));
        expect(screen.getByTestId('task-modal')).toBeTruthy();
    });

    // Alert

    it('dismisses the alert when onConfirm is called', async () => {
        taskService.deleteTask.mockRejectedValue(new Error('fail'));
        setupSubscription(makeTasks());

        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));

        await waitFor(() => expect(screen.getByTestId('task-modal')).toBeTruthy());

        await act(async () => {
            fireEvent.press(screen.getByTestId('task-modal'));
        });

        await waitFor(() => screen.getByTestId('alert'));
        fireEvent.press(screen.getByTestId('alert'));
        await waitFor(() => expect(screen.queryByTestId('alert')).toBeNull());
    });
});