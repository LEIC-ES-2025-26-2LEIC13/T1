/**
 * Integration Tests — templates.jsx + templateProject.jsx
 *
 * These tests exercise the interaction between the Templates list screen
 * and the ProjectScreen (templateProject) through the shared useTemplate hook,
 * focusing on data flow: creating a template and navigating into its project screen.
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Templates from '../../app/(admin)/templates';
import ProjectScreen from '../../app/(admin)/templateProject';
import { useTemplate } from '../../hooks/useTemplate';
import { templateService } from '../../api/templateService';
import { ALERT_TYPES } from '../../components/ThemedAlert';

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

jest.mock('../../hooks/useTemplate');
jest.mock('../../api/templateService');

jest.mock('react-native-reorderable-list', () => ({
    __esModule: true,
    default: ({ data, renderItem, ListEmptyComponent, onReorder, keyExtractor }) => {
        const React = require('react');
        const { View, TouchableOpacity } = require('react-native'); // ← must destructure TouchableOpacity
        return (
            <View testID="reorderable-list">
                <TouchableOpacity  // ← must be TouchableOpacity, not View
                    testID="trigger-reorder"
                    onPress={() => onReorder && onReorder({ from: 0, to: 1 })}
                />
                {data.length === 0
                    ? ListEmptyComponent
                    : data.map((item, index) => (
                          <View key={keyExtractor ? keyExtractor(item) : item.id}>
                              {renderItem({ item, index })}
                          </View>
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

const sharedMocks = () => {
    jest.mock('../../components/ThemedView', () => {
        const { View } = require('react-native');
        return ({ children, ...p }) => <View {...p}>{children}</View>;
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
    jest.mock('../../components/AnimatedPressable', () => {
        const { TouchableOpacity } = require('react-native');
        return ({ children, onPress, ...p }) => (
            <TouchableOpacity onPress={onPress} {...p}>{children}</TouchableOpacity>
        );
    });
};

jest.mock('../../components/ThemedView', () => {
    const { View } = require('react-native');
    return ({ children, ...p }) => <View {...p}>{children}</View>;
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
jest.mock('../../components/AnimatedPressable', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, ...p }) => (
        <TouchableOpacity onPress={onPress} {...p}>{children}</TouchableOpacity>
    );
});
jest.mock('../../components/ThemedProject', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ name, templateId, onLongPress }) => (
        <TouchableOpacity testID={`project-${templateId}`} onLongPress={onLongPress}>
            <Text>{name}</Text>
        </TouchableOpacity>
    );
});
jest.mock('../../components/CreateTemplateModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, onCreate, project, onChange }) =>
        visible ? (
            <View testID="create-template-modal">
                <TouchableOpacity
                    testID="modal-create-btn"
                    onPress={() => onCreate({ title: 'New Template', description: 'Desc' })}
                >
                    <Text>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-btn" onPress={onClose}>
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
jest.mock('../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children, ...p }) => <View {...p}>{children}</View>;
});
jest.mock('../../components/OverflowMenu', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ actions, testID }) => (
        <View testID={testID}>
            {actions.map((a) => (
                <TouchableOpacity key={a.id} testID={a.testID} onPress={a.onPress}>
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
                    <Text>Create Column</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-column-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../components/EditProjectModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, onClose, project, onChange, onSave }) =>
        visible ? (
            <View testID="edit-project-modal">
                <TouchableOpacity
                    testID="modal-save-project-btn"
                    onPress={() => onSave({ title: 'Updated', description: '' })}
                >
                    <Text>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="modal-close-edit-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});
jest.mock('../../app/(admin)/templateColumns', () => {
    const { View } = require('react-native');
    return ({ columns, openCreateColumnModal }) => (
        <View testID="template-columns" />
    );
});
jest.mock('../../constants/Colors', () => ({
    ProjectColors: ['#FF0000', '#00FF00', '#0000FF'],
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const baseTemplates = [{ id: 'tpl-1', title: 'My Template', description: 'Desc' }];

const buildUseTemplate = (overrides = {}) => ({
    templates: baseTemplates,
    setTemplates: jest.fn(),
    createTemplate: jest.fn().mockResolvedValue(undefined),
    reorderTemplates: jest.fn().mockResolvedValue(undefined),
    deleteTemplate: jest.fn().mockResolvedValue(undefined),
    columns: [],
    setActiveTemplateId: jest.fn(),
    createColumn: jest.fn().mockResolvedValue(undefined),
    isLoadingTemplates: false,
    ...overrides,
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Templates + ProjectScreen — integration tests', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('Template creation flow (Templates screen)', () => {
        it('opens the create-template modal and creates a template on confirm', async () => {
            const createTemplate = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate({ createTemplate }));

            const { getByTestId, queryByTestId } = render(<Templates />);

            fireEvent.press(getByTestId('open-create-template-modal-button'));
            expect(getByTestId('create-template-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-btn'));
            });

            expect(createTemplate).toHaveBeenCalledWith({
                title: 'New Template',
                description: 'Desc',
            });
            await waitFor(() => {
                expect(queryByTestId('create-template-modal')).toBeNull();
            });
        });

        it('closes the modal without creating when close is pressed', async () => {
            const createTemplate = jest.fn();
            useTemplate.mockReturnValue(buildUseTemplate({ createTemplate }));

            const { getByTestId, queryByTestId } = render(<Templates />);
            fireEvent.press(getByTestId('open-create-template-modal-button'));
            fireEvent.press(getByTestId('modal-close-btn'));

            expect(createTemplate).not.toHaveBeenCalled();
            expect(queryByTestId('create-template-modal')).toBeNull();
        });

        it('shows an error alert when createTemplate fails', async () => {
            const createTemplate = jest.fn().mockRejectedValue(new Error('Create failed'));
            useTemplate.mockReturnValue(buildUseTemplate({ createTemplate }));

            const { getByTestId, findByTestId } = render(<Templates />);
            fireEvent.press(getByTestId('open-create-template-modal-button'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Create Template Failed');
        });

        it('error alert can be dismissed', async () => {
            const createTemplate = jest.fn().mockRejectedValue(new Error('err'));
            useTemplate.mockReturnValue(buildUseTemplate({ createTemplate }));

            const { getByTestId, findByTestId } = render(<Templates />);
            fireEvent.press(getByTestId('open-create-template-modal-button'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-btn'));
            });

            const confirm = await findByTestId('alert-confirm');
            fireEvent.press(confirm);

            await waitFor(() => {
                expect(() => getByTestId('themed-alert')).toThrow();
            });
        });
    });

    describe('ProjectScreen — template deletion flow', () => {
        it('shows success alert and navigates back after deletion', async () => {
            const back = jest.fn();
            const { useRouter } = require('expo-router');
            useRouter.mockReturnValue({ canGoBack: jest.fn(() => true), back, replace: jest.fn() });
            const deleteTemplate = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate({ deleteTemplate }));

            const { getByTestId, findByTestId } = render(<ProjectScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('delete-project-action'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Success');

            const confirm = await findByTestId('alert-confirm');
            fireEvent.press(confirm);

            expect(back).toHaveBeenCalled();
        });

        it('shows error alert when deleteTemplate fails', async () => {
            const deleteTemplate = jest.fn().mockRejectedValue(new Error('Delete failed'));
            useTemplate.mockReturnValue(buildUseTemplate({ deleteTemplate }));

            const { getByTestId, findByTestId } = render(<ProjectScreen />);

            await act(async () => {
                fireEvent.press(getByTestId('delete-project-action'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Deletion Failed');
        });
    });

    describe('ProjectScreen — template edit flow', () => {
        it('opens edit modal, saves, and shows success alert', async () => {
            templateService.updateTemplate = jest.fn().mockResolvedValue(undefined);
            useTemplate.mockReturnValue(buildUseTemplate());

            const { getByTestId, findByTestId } = render(<ProjectScreen />);

            fireEvent.press(getByTestId('edit-project-action'));
            expect(getByTestId('edit-project-modal')).toBeTruthy();

            await act(async () => {
                fireEvent.press(getByTestId('modal-save-project-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Success');
            expect(templateService.updateTemplate).toHaveBeenCalledWith('tpl-1', {
                title: 'Updated',
                description: '',
            });
        });

        it('shows error alert when updateTemplate fails', async () => {
            templateService.updateTemplate = jest.fn().mockRejectedValue(new Error('Update failed'));
            useTemplate.mockReturnValue(buildUseTemplate());

            const { getByTestId, findByTestId } = render(<ProjectScreen />);

            fireEvent.press(getByTestId('edit-project-action'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-save-project-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Update Failed');
        });
    });

    describe('ProjectScreen — column creation flow', () => {
        it('opens create-column modal, creates column, and closes modal', async () => {
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

        it('shows error alert when createColumn fails', async () => {
            const createColumn = jest.fn().mockRejectedValue(new Error('Column error'));
            useTemplate.mockReturnValue(buildUseTemplate({ createColumn }));

            const { getByTestId, findByTestId } = render(<ProjectScreen />);

            fireEvent.press(getByTestId('create-column-icon'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-create-column-btn'));
            });

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Column Creation Failed');
        });
    });

    describe('ProjectScreen — access-lost guard', () => {
        it('shows access-lost alert when template disappears while not deleting', async () => {
            useTemplate.mockReturnValue(buildUseTemplate({ templates: [] }));
            const { findByTestId } = render(<ProjectScreen />);

            const title = await findByTestId('alert-title');
            expect(title.props.children).toBe('Access Lost');
        });
    });
});
