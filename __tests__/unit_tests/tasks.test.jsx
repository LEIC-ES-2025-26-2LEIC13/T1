import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
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
                onPress={() => props.onClose()}
            />
        );
    };
});

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
    taskService.subscribeToUserTasks.mockImplementation((_uid, cb) => {
        cb(tasks);
        return jest.fn();
    });
}

// Tests

describe('Tasks — unit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: MOCK_USER });
    });

    // Rendering

    it('renders without crashing', () => {
        setupSubscription([]);
        render(<Tasks />);
        expect(screen.toJSON()).not.toBeNull();
    });

    // Empty state

    it('shows EmptyState when there are no tasks', () => {
        setupSubscription([]);
        render(<Tasks />);
        expect(screen.getByTestId('empty-state')).toBeTruthy();
    });

    it('hides EmptyState when tasks exist', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        expect(screen.queryByTestId('empty-state')).toBeNull();
    });

    // Task list

    it('renders a ThemedTask for each task', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        makeTasks().forEach((t) => expect(screen.getByTestId(`task-${t.id}`)).toBeTruthy());
    });

    // Project labels

    it('renders one label per unique projectName', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        expect(screen.getAllByText('Alpha')).toHaveLength(1);
        expect(screen.getAllByText('Beta')).toHaveLength(1);
    });

    it('does not duplicate a label when multiple tasks share a project', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        expect(screen.getAllByText('Alpha')).toHaveLength(1); // t1 + t2 are both Alpha
    });

    // Subscription lifecycle

    it('subscribes with the current user uid', () => {
        setupSubscription([]);
        render(<Tasks />);
        expect(taskService.subscribeToUserTasks).toHaveBeenCalledWith(MOCK_USER.uid, expect.any(Function));
    });

    it('calls unsub on unmount', () => {
        const unsub = jest.fn();
        taskService.subscribeToUserTasks.mockReturnValue(unsub);
        render(<Tasks />);
        screen.unmount();
        expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('does not subscribe when uid is absent', () => {
        useAuth.mockReturnValue({ user: {} });
        render(<Tasks />);
        expect(taskService.subscribeToUserTasks).not.toHaveBeenCalled();
    });

    // Modal

    it('TaskModal is hidden initially', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        expect(screen.queryByTestId('task-modal')).toBeNull();
    });

    it('opens TaskModal when a task is pressed', () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));
        expect(screen.getByTestId('task-modal')).toBeTruthy();
    });

    it('closes TaskModal when onClose is called', async () => {
        setupSubscription(makeTasks());
        render(<Tasks />);
        fireEvent.press(screen.getByTestId('task-t1'));
        fireEvent.press(screen.getByTestId('task-modal'));
        await waitFor(() => expect(screen.queryByTestId('task-modal')).toBeNull());
    });

    // Alert

    it('ThemedAlert is hidden initially', () => {
        setupSubscription([]);
        render(<Tasks />);
        expect(screen.queryByTestId('alert')).toBeNull();
    });
});
