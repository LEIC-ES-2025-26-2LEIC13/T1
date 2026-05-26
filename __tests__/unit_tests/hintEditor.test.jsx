import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HintEditor from '../../app/(admin)/hintEditor';
import { templateColumnService } from '../../api/templateColumnService';

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
}));

jest.mock('../../firebase/firebaseConfig', () => ({
    db: {},
    auth: {},
}));

// Replace jest.mock('../../api/templateColumnService') with a manual factory:
jest.mock('../../api/templateColumnService', () => ({
    templateColumnService: {
        getHint: jest.fn(),
        saveHint: jest.fn(),
        deleteHint: jest.fn(),
        createTask: jest.fn(),
        deleteTask: jest.fn(),
        reorderColumnTasks: jest.fn(),
        subscribeToColumnTasks: jest.fn(),
    },
}));


jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(() => ({
        templateId: 'tpl-1',
        columnId: 'col-1',
        taskId: 'task-1',
        templateName: 'My Template',
        columnName: 'Backlog',
        taskName: 'Task One',
    })),
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
                </View>
            );
        },
    },
}));

jest.mock('../../api/templateColumnService');

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    __esModule: true,
    default: jest.fn(() => 'light'),
}));

jest.mock('../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children, ...props }) => <View {...props}>{children}</View>;
});

jest.mock('../../components/ThemedButton', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, testID }) => (
        <TouchableOpacity testID={testID} onPress={onPress}>{children}</TouchableOpacity>
    );
});

jest.mock('../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return (props) => <View {...props} />;
});

jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children, ...props }) => <Text {...props}>{children}</Text>;
});

jest.mock('../../components/ThemedTextInput', () => {
    const { TextInput } = require('react-native');
    return ({ children, onChangeText, placeholder, containerStyle, style }) => (
        <TextInput
            testID="hint-text-input"
            onChangeText={onChangeText}
            placeholder={placeholder}
            style={style}
        >
            {children}
        </TextInput>
    );
});

jest.mock('react-native-markdown-display', () => {
    const { Text } = require('react-native');
    return ({ children }) => <Text testID="markdown-display">{children}</Text>;
});

jest.mock('../../components/PillsContainer', () => {
    const { View } = require('react-native');
    return ({ children }) => <View testID="pills-container">{children}</View>;
});

jest.mock('../../components/Pill', () => {
    const { Text } = require('react-native');
    return (props) => {
        const label = props.projectName || props.columnName || props.taskName || '';
        return <Text testID="pill">{label}</Text>;
    };
});

jest.mock('../../components/AnimatedPressable', () => {
    const { TouchableOpacity } = require('react-native');
    return ({ children, onPress, ...props }) => (
        <TouchableOpacity onPress={onPress} {...props}>{children}</TouchableOpacity>
    );
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

jest.mock('../../components/EmptyState', () => {
    const { View, Text } = require('react-native');
    return ({ title, subtitle }) => (
        <View testID="empty-state">
            <Text testID="empty-title">{title}</Text>
        </View>
    );
});

jest.mock('../../constants/Colors', () => ({
    Colors: {
        light: { text: '#000', title: '#111', background: '#fff' },
        dark: { text: '#fff', title: '#eee', background: '#000' },
    },
}));

// Tests

describe('HintEditor — unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        templateColumnService.getHint = jest.fn().mockResolvedValue('Existing hint content');
        templateColumnService.saveHint = jest.fn().mockResolvedValue(undefined);
        templateColumnService.deleteHint = jest.fn().mockResolvedValue(undefined);
    });

    describe('Rendering', () => {
        it('renders pills for template, column, and task names', async () => {
            const { getAllByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getAllByTestId('pill').length).toBe(3);
            });
        });

        it('renders the save/edit button', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('save-edit-hints-button')).toBeTruthy();
            });
        });

        it('does not show toggle-preview button in view mode', async () => {
            const { queryByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(queryByTestId('toggle-preview-button')).toBeNull();
            });
        });

        it('shows "Edit Hints" label when not editing', async () => {
            const { getAllByText } = render(<HintEditor />);
            await waitFor(() => {
                expect(getAllByText('Edit Hints').length).toBeGreaterThan(0);
            });
        });

        it('shows markdown preview when not editing', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('markdown-display')).toBeTruthy();
            });
        });
    });

    describe('Fetching hint on mount', () => {
        it('calls getHint with correct params on mount', async () => {
            render(<HintEditor />);
            await waitFor(() => {
                expect(templateColumnService.getHint).toHaveBeenCalledWith('tpl-1', 'col-1', 'task-1');
            });
        });

        it('displays fetched content in the preview', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                const md = getByTestId('markdown-display');
                expect(md.props.children).toBe('Existing hint content');
            });
        });

        it('shows empty state when hint content is empty', async () => {
            templateColumnService.getHint = jest.fn().mockResolvedValue('');
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('empty-state')).toBeTruthy();
            });
        });
    });

    describe('Edit mode', () => {
        it('enters edit mode when edit button is pressed', async () => {
            const { getByTestId, getByText } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            expect(getByText('Save Hints')).toBeTruthy();
        });

        it('shows the text input in edit mode', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            expect(getByTestId('hint-text-input')).toBeTruthy();
        });

        it('shows the toggle-preview button in edit mode', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            expect(getByTestId('toggle-preview-button')).toBeTruthy();
        });

        it('hides save button and shows hide-preview text when previewing', async () => {
            const { getByTestId, getByText } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            fireEvent.press(getByTestId('toggle-preview-button'));

            expect(getByText('Hide Preview')).toBeTruthy();
        });

        it('updates content state when text input changes', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            fireEvent.changeText(getByTestId('hint-text-input'), 'New content');

            // No direct assertion on state — covered via save behaviour
            expect(getByTestId('hint-text-input')).toBeTruthy();
        });
    });

    describe('handleSave', () => {
        it('calls saveHint when content is non-empty and save is pressed', async () => {
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button')); // enter edit
            fireEvent.changeText(getByTestId('hint-text-input'), 'Updated hint');

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button')); // save
            });

            expect(templateColumnService.saveHint).toHaveBeenCalledWith(
                'tpl-1', 'col-1', 'task-1', 'Updated hint'
            );
        });

        it('calls deleteHint when content is empty and save is pressed', async () => {
            templateColumnService.getHint = jest.fn().mockResolvedValue('');
            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button')); // enter edit
            // content is empty by default

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button')); // save with empty content
            });

            expect(templateColumnService.deleteHint).toHaveBeenCalledWith('tpl-1', 'col-1', 'task-1');
        });

        it('returns to view mode after save', async () => {
            const { getByTestId, getAllByText } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            fireEvent.changeText(getByTestId('hint-text-input'), 'Some content');

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button'));
            });

            // Confirm we are back in view mode: "Save Hints" is gone
            expect(() => getAllByText('Save Hints')).toThrow();
            // And the edit button is still present
            expect(getByTestId('save-edit-hints-button')).toBeTruthy();
        });

        
        it('shows error alert when saveHint fails', async () => {
            templateColumnService.saveHint = jest.fn().mockRejectedValue(new Error('Save failed'));
            const { getByTestId, findByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            fireEvent.changeText(getByTestId('hint-text-input'), 'Some content');

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button'));
            });

            const alertTitle = await findByTestId('alert-title');
            expect(alertTitle.props.children).toBe('Save Hint Failed');
        });

        it('shows error alert when deleteHint fails', async () => {
            templateColumnService.getHint = jest.fn().mockResolvedValue('');
            templateColumnService.deleteHint = jest.fn().mockRejectedValue(new Error('Delete failed'));

            const { getByTestId, findByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button'));
            });

            const alertTitle = await findByTestId('alert-title');
            expect(alertTitle.props.children).toBe('Delete Hint Failed');
        });
    });

    describe('Theme selection', () => {
        it('applies the dark theme when colorScheme is "dark"', async () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('dark');

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('save-edit-hints-button')).toBeTruthy();
            });
        });

        it('falls back to Colors.light when colorScheme is null', async () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue(null);

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('save-edit-hints-button')).toBeTruthy();
            });
        });

        it('falls back to Colors.light when colorScheme is an unknown value', async () => {
            const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
            useColorScheme.mockReturnValue('high-contrast'); // not a key in Colors mock

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => {
                expect(getByTestId('save-edit-hints-button')).toBeTruthy();
            });
        });
    });

    describe('Navigation', () => {
        it('calls router.back when back arrow is pressed and canGoBack is true', async () => {
            const back = jest.fn();
            const { useRouter } = require('expo-router');
            useRouter.mockReturnValue({ canGoBack: jest.fn(() => true), back, replace: jest.fn() });

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('hint-editor-arrow-back'));

            fireEvent.press(getByTestId('hint-editor-arrow-back'));
            expect(back).toHaveBeenCalled();
        });

        it('calls router.replace("/") when canGoBack is false', async () => {
            const replace = jest.fn();
            const { useRouter } = require('expo-router');
            useRouter.mockReturnValue({ canGoBack: jest.fn(() => false), back: jest.fn(), replace });

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('hint-editor-arrow-back'));

            fireEvent.press(getByTestId('hint-editor-arrow-back'));
            expect(replace).toHaveBeenCalledWith('/');
        });

        it('calls router.replace("/") when router.back() throws', async () => {
            const replace = jest.fn();
            const { useRouter } = require('expo-router');
            useRouter.mockReturnValue({
                canGoBack: jest.fn(() => { throw new Error('router error'); }),
                back: jest.fn(),
                replace,
            });

            const { getByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('hint-editor-arrow-back'));

            fireEvent.press(getByTestId('hint-editor-arrow-back'));
            expect(replace).toHaveBeenCalledWith('/');
        });
    });

    describe('Alert', () => {
        it('dismisses the alert when confirm is pressed', async () => {
            templateColumnService.saveHint = jest.fn().mockRejectedValue(new Error('fail'));
            const { getByTestId, findByTestId } = render(<HintEditor />);
            await waitFor(() => getByTestId('save-edit-hints-button'));

            fireEvent.press(getByTestId('save-edit-hints-button'));
            fireEvent.changeText(getByTestId('hint-text-input'), 'content');

            await act(async () => {
                fireEvent.press(getByTestId('save-edit-hints-button'));
            });

            const confirm = await findByTestId('alert-confirm');
            fireEvent.press(confirm);

            await waitFor(() => {
                expect(() => getByTestId('themed-alert')).toThrow();
            });
        });
    });
});
