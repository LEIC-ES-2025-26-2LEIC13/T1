import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProjectScreen from '../../app/(admin)/templateProject';
import { useTemplate } from '../../hooks/useTemplate';
import { templateColumnService } from '../../api/templateColumnService';
import { templateService } from '../../api/templateService';

// Mocks

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(),
    runTransaction: jest.fn(),
    getCountFromServer: jest.fn(),
    deleteField: jest.fn(),
    collection: jest.fn(),
    writeBatch: jest.fn(),
}));

jest.mock('../../firebase/firebaseConfig', () => ({
    db: {},
    auth: {},
}));

jest.mock('firebase/auth', () => ({
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithCredential: jest.fn(),
    getAuth: jest.fn(),
}));

jest.mock('../../api/authService', () => ({
    authService: {
        signOut: jest.fn(),
        onAuthStateChanged: jest.fn(),
    },
}));

jest.mock('../../contexts/authContext', () => ({
    AuthProvider: ({ children }) => children,
    useAuthContext: jest.fn(() => ({ user: null })),
}));

jest.mock('../../contexts/templateContext', () => ({
    TemplateProvider: ({ children }) => children,
    useTemplateContext: jest.fn(() => ({})),
}));

jest.mock('../../hooks/useTemplate', () => ({
    useTemplate: jest.fn(),
}));

jest.mock('../../api/templateColumnService', () => ({
    templateColumnService: {
        subscribeToColumnTasks: jest.fn(),
        createTask: jest.fn(),
        deleteTask: jest.fn(),
        reorderColumnTasks: jest.fn(),
    },
}));

jest.mock('../../api/templateService', () => ({
    templateService: {
        updateTemplate: jest.fn(),
        deleteTemplate: jest.fn(),
        createTemplate: jest.fn(),
        getTemplates: jest.fn(),
    },
}));

jest.mock('react-native-reorderable-list', () => ({
    __esModule: true,
    default: ({ data, renderItem, ListEmptyComponent, onReorder }) => {
        const React = require('react');
        const { View } = require('react-native');
        return (
            <View testID="reorderable-list">
                {data.length === 0
                    ? ListEmptyComponent
                    : data.map((item, index) => (
                          <View key={item.id}>{renderItem({ item, index })}</View>
                      ))}
            </View>
        );
    },
    reorderItems: jest.fn((items, from, to) => {
        const arr = [...items];
        arr.splice(to, 0, arr.splice(from, 1)[0]);
        return arr;
    }),
    useReorderableDrag: jest.fn(() => jest.fn()),
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }) => children,
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    __esModule: true,
    default: jest.fn(() => 'light'),
}));

jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(() => ({ templateId: 'tpl-1' })),
    useRouter: jest.fn(() => ({
        canGoBack: jest.fn(() => true),
        back: jest.fn(),
        replace: jest.fn(),
    })),
    Stack: {
        Screen: ({ options }) => {
            const React = require('react');
            const { View } = require('react-native');
            return (
                <View testID="stack-screen">
                    <View testID="header-title">{options?.headerTitle?.()}</View>
                    <View testID="header-left">{options?.headerLeft?.()}</View>
                    <View testID="header-right">{options?.headerRight?.()}</View>
                </View>
            );
        },
    },
}));

jest.mock('react-native', () => {
    const rn = jest.requireActual('react-native');
    rn.useWindowDimensions = jest.fn(() => ({ width: 390 }));
    return rn;
});

jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children, ...p }) => <Text {...p}>{children}</Text>;
});
jest.mock('../../components/ThemedButton', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, testID, disabled }) => (
        <TouchableOpacity testID={testID} onPress={onPress} disabled={disabled}>{children}</TouchableOpacity>
    );
});
jest.mock('../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return (p) => <View {...p} />;
});
jest.mock('../../components/ThemedTask', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ task, onPress, testID, onLongPress }) => (
        <TouchableOpacity testID={testID} onPress={onPress} onLongPress={onLongPress}>
            <Text>{task.name}</Text>
        </TouchableOpacity>
    );
});
jest.mock('../../components/AnimatedPressable', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, ...p }) => (
        <TouchableOpacity onPress={onPress} {...p}>{children}</TouchableOpacity>
    );
});
jest.mock('../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children, ...p }) => <View {...p}>{children}</View>;
});
jest.mock('../../components/OverflowMenu', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ actions, testID }) => (
        <View testID={testID}>
            {actions.map((a) => (
                <TouchableOpacity key={a.id} testID={a.testID ?? `overflow-${a.id}`} onPress={a.onPress}>
                    <Text>{a.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
});
jest.mock('../../components/CreateColumnModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, onCreate, onChange, columnData }) =>
        visible ? (
            <View testID="create-column-modal">
                <TouchableOpacity
                    testID="modal-create-column-btn"
                    onPress={() => onCreate({ name: 'Sprint 1' })}
                >
                    <Text>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-column-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../components/EditProjectModal', () => {
    const { View } = require('react-native');
    return ({ visible }) => (visible ? <View testID="edit-project-modal" /> : null);
});
jest.mock('../../components/EditColumnModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, onEdit, columnData }) =>
        visible ? (
            <View testID="edit-column-modal">
                <TouchableOpacity
                    testID="modal-edit-column-btn"
                    onPress={() => onEdit({ name: 'Updated Column' })}
                >
                    <Text>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-edit-column-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../components/TemplateCreateTaskModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, onCreate, task, onChange }) =>
        visible ? (
            <View testID="create-task-modal">
                <TouchableOpacity
                    testID="modal-create-task-btn"
                    onPress={() => onCreate({ name: 'New Task', description: '' })}
                >
                    <Text>Create Task</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-task-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../components/TemplateTaskModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, deleteTask, task }) =>
        visible ? (
            <View testID="task-details-modal">
                <TouchableOpacity
                    testID="modal-delete-task-btn"
                    onPress={() => task && deleteTask(task)}
                >
                    <Text>Delete Task</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-task-details-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../components/EmptyState', () => {
    const { View, Text } = require('react-native');
    return ({ title }) => <View testID="empty-state"><Text>{title}</Text></View>;
});
jest.mock('../../components/ThemedAlert', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    const mock = ({ visible, alert, onConfirm }) =>
        visible ? (
            <View testID="themed-alert">
                <Text testID="alert-title">{alert?.title}</Text>
                <Text testID="alert-message">{alert?.message}</Text>
                <TouchableOpacity testID="alert-confirm" onPress={onConfirm}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
        ) : null;
    mock.ALERT_TYPES = { ERROR: 'error', SUCCESS: 'success', INFO: 'info' };
    return mock;
});
jest.mock('../../components/LoadingScreen', () => {
    const { View, Text } = require('react-native');
    return ({ loadingText }) => <View testID="loading-screen"><Text>{loadingText}</Text></View>;
});
jest.mock('../../components/Divider', () => {
    const { View } = require('react-native');
    return () => <View testID="divider" />;
});
jest.mock('../../components/Spacer', () => {
    const { View } = require('react-native');
    return () => <View testID="spacer" />;
});
jest.mock('../../constants/Colors', () => ({
    Colors: {
        light: { navBackground: '#fff', borders: '#ccc', background: '#f5f5f5', text: '#000', title: '#111' },
        dark: { navBackground: '#111', borders: '#333', background: '#000', text: '#fff', title: '#eee' },
    },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockTemplates = [{ id: 'tpl-1', title: 'My Template', description: 'Desc' }];
const mockColumns = [
    { id: 'col-1', name: 'Backlog' },
    { id: 'col-2', name: 'In Progress' },
];
const mockTasks = [
    { id: 'task-1', name: 'Task One', order: 0, description: '' },
];

const buildUseTemplate = (overrides = {}) => ({
    templates: mockTemplates,
    deleteTemplate: jest.fn().mockResolvedValue(undefined),
    columns: mockColumns,
    setActiveTemplateId: jest.fn(),
    createColumn: jest.fn().mockResolvedValue(undefined),
    deleteColumn: jest.fn().mockResolvedValue(undefined),
    updateColumn: jest.fn().mockResolvedValue(undefined),
    ...overrides,
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ProjectScreen + TemplateColumns + TemplateColumn — integration tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useTemplate.mockReturnValue(buildUseTemplate());
        templateColumnService.subscribeToColumnTasks = jest.fn((tid, cid, cb) => {
            cb(mockTasks);
            return jest.fn();
        });
        templateColumnService.createTask = jest.fn().mockResolvedValue(undefined);
        templateColumnService.deleteTask = jest.fn().mockResolvedValue(undefined);
        templateColumnService.reorderColumnTasks = jest.fn().mockResolvedValue(undefined);
        templateService.updateTemplate = jest.fn().mockResolvedValue(undefined);
    });

    describe('Column rendering through ProjectScreen', () => {
        it('renders all columns from useTemplate through TemplateColumns and TemplateColumn', () => {
            const { getByText } = render(<ProjectScreen />);
            expect(getByText('Backlog')).toBeTruthy();
            expect(getByText('In Progress')).toBeTruthy();
        });

        it('subscribes to tasks for each rendered column', () => {
            render(<ProjectScreen />);
            expect(templateColumnService.subscribeToColumnTasks).toHaveBeenCalledWith(
                'tpl-1', 'col-1', expect.any(Function)
            );
            expect(templateColumnService.subscribeToColumnTasks).toHaveBeenCalledWith(
                'tpl-1', 'col-2', expect.any(Function)
            );
        });

        it('renders tasks within the correct column', () => {
            const { getAllByTestId } = render(<ProjectScreen />);
            // Task appears in each column that subscribes to mockTasks
            const tasks = getAllByTestId('task-Task One-0');
            expect(tasks.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Empty-columns state', () => {
        it('shows "Create Column" button when columns list is empty', () => {
            useTemplate.mockReturnValue(buildUseTemplate({ columns: [] }));
            const { getByTestId } = render(<ProjectScreen />);
            expect(getByTestId('open-create-column-modal-button')).toBeTruthy();
        });
    });

    describe('Column creation via header icon', () => {
        it('column creation from header icon calls createColumn on confirm', async () => {
            const createColumn = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate({ createColumn }));

            const { getByTestId, queryByTestId } = render(<ProjectScreen />);
            fireEvent.press(getByTestId('create-column-icon'));
            expect(getByTestId('create-column-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-column-btn'));
            });

            expect(createColumn).toHaveBeenCalledWith({ name: 'Sprint 1' });
            await waitFor(() => {
                expect(queryByTestId('create-column-modal')).toBeNull();
            });
        });
    });

    describe('Task creation flow (column → task modal)', () => {
        it('creates a task and closes the modal on success', async () => {
            const { getAllByTestId, getByTestId, queryByTestId } = render(<ProjectScreen />);

            // Multiple columns render the button — pick the first one
            const createButtons = getAllByTestId('open-create-task-modal-button');
            fireEvent.press(createButtons[0]);
            expect(getByTestId('create-task-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-task-btn'));
            });

            expect(templateColumnService.createTask).toHaveBeenCalledWith(
                'tpl-1', 'col-1', { name: 'New Task', description: '' }
            );
            await waitFor(() => {
                expect(queryByTestId('create-task-modal')).toBeNull();
            });
        });

        it('shows error alert when createTask fails', async () => {
            templateColumnService.createTask = jest.fn().mockRejectedValue(new Error('Task err'));

            const { getAllByTestId, getByTestId, findByTestId } = render(<ProjectScreen />);
            const createButtons = getAllByTestId('open-create-task-modal-button');
            fireEvent.press(createButtons[0]);

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-task-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Task Creation Failed');
        });
    });

    describe('Task deletion flow', () => {
        it('opens task details and deletes the task', async () => {
            const { getAllByTestId, getByTestId, queryByTestId } = render(<ProjectScreen />);

            const tasks = getAllByTestId('task-Task One-0');
            fireEvent.press(tasks[0]);
            expect(getByTestId('task-details-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-task-btn'));
            });

            expect(templateColumnService.deleteTask).toHaveBeenCalledWith('tpl-1', 'col-1', 'task-1');
            await waitFor(() => {
                expect(queryByTestId('task-details-modal')).toBeNull();
            });
        });


        it('shows error alert when deleteTask fails', async () => {
            templateColumnService.deleteTask = jest.fn().mockRejectedValue(new Error('Delete err'));

            const { getAllByTestId, getByTestId, findByTestId } = render(<ProjectScreen />);
            const tasks = getAllByTestId('task-Task One-0');
            fireEvent.press(tasks[0]);

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-task-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Delete Task Failed');
        });
    });
    });

    describe('Column edit flow', () => {
        it('opens edit-column modal and saves changes via updateColumn', async () => {
            const updateColumn = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate({ updateColumn }));

            const { getAllByTestId, getByTestId, queryByTestId } = render(<ProjectScreen />);

            // Each column renders an overflow-edit action
            const editButtons = getAllByTestId('overflow-edit');
            fireEvent.press(editButtons[0]);

            expect(getByTestId('edit-column-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-edit-column-btn'));
            });

            expect(updateColumn).toHaveBeenCalledWith('col-1', { name: 'Updated Column' });
            await waitFor(() => {
                expect(queryByTestId('edit-column-modal')).toBeNull();
            });
        });

        it('shows error alert when updateColumn fails', async () => {
            const updateColumn = jest.fn().mockRejectedValue(new Error('Col update err'));
            useTemplate.mockReturnValue(buildUseTemplate({ updateColumn }));

            const { getAllByTestId, getByTestId, findByTestId } = render(<ProjectScreen />);
            const editButtons = getAllByTestId('overflow-edit');
            fireEvent.press(editButtons[0]);

            await act(async () => {
                fireEvent.press(getByTestId('modal-edit-column-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Column Update Failed');
        });
    });

    describe('Column delete flow', () => {
        it('calls deleteColumn when delete overflow action is pressed', async () => {
            const deleteColumn = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate({ deleteColumn }));

            const { getAllByTestId } = render(<ProjectScreen />);
            const deleteButtons = getAllByTestId('overflow-delete');

            await act(async () => {
                fireEvent.press(deleteButtons[0]);
            });

            expect(deleteColumn).toHaveBeenCalledWith('col-1');
        });
    });

    describe('setActiveTemplateId lifecycle', () => {
        it('sets and clears the active template ID through the full screen lifecycle', () => {
            const setActiveTemplateId = jest.fn();
            useTemplate.mockReturnValue(buildUseTemplate({ setActiveTemplateId }));

            const { unmount } = render(<ProjectScreen />);
            expect(setActiveTemplateId).toHaveBeenCalledWith('tpl-1');

            unmount();
            expect(setActiveTemplateId).toHaveBeenLastCalledWith('');
        });
    });

    describe('Snap offsets', () => {
        it('computes middle-column snap offsets for 3+ columns via ProjectScreen', () => {
            const threeColumns = [
                { id: 'col-1', name: 'A' },
                { id: 'col-2', name: 'B' },
                { id: 'col-3', name: 'C' },
            ];
            useTemplate.mockReturnValue(buildUseTemplate({ columns: threeColumns }));
            expect(() => render(<ProjectScreen />)).not.toThrow();
        });
});