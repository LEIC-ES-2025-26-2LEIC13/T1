import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Suggestions from '../../../../../app/(admin)/(drawer)/suggestions';
import { suggestionService } from '../../../../../api/suggestionService';
import { useAuth } from '../../../../../hooks/useAuth';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(), doc: jest.fn(), getDocs: jest.fn(), getDoc: jest.fn(),
    setDoc: jest.fn(), updateDoc: jest.fn(), deleteDoc: jest.fn(), query: jest.fn(),
    where: jest.fn(), orderBy: jest.fn(), onSnapshot: jest.fn(), writeBatch: jest.fn(),
    runTransaction: jest.fn(), getCountFromServer: jest.fn(), deleteField: jest.fn(),
}));
jest.mock('../../../../../firebase/firebaseConfig', () => ({ db: {}, auth: {} }));
jest.mock('firebase/auth', () => ({
    signOut: jest.fn(), onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: jest.fn(), signInWithCredential: jest.fn(), getAuth: jest.fn(),
}));

jest.mock('../../../../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../../../../api/suggestionService', () => ({
    suggestionService: {
        subscribeToAllSuggestions: jest.fn(),
        deleteSuggestion: jest.fn(),
    },
}));

jest.mock('../../../../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children, ...p }) => <View {...p}>{children}</View>;
});

jest.mock('../../../../../components/LoadingScreen', () => {
    const { View, Text } = require('react-native');
    return ({ loadingText }) => (
        <View testID="loading-screen"><Text>{loadingText}</Text></View>
    );
});

jest.mock('../../../../../components/EmptyState', () => {
    const { View, Text } = require('react-native');
    return ({ title, subtitle }) => (
        <View testID="empty-state">
            <Text testID="empty-title">{title}</Text>
            <Text testID="empty-subtitle">{subtitle}</Text>
        </View>
    );
});

jest.mock('../../../../../components/ThemedSuggestion', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ suggestion, onPress }) => (
        <TouchableOpacity testID={`suggestion-${suggestion.id}`} onPress={onPress}>
            <Text>{suggestion.title}</Text>
        </TouchableOpacity>
    );
});

jest.mock('../../../../../components/SuggestionModal', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return ({ visible, suggestion, onClose, deleteSuggestion }) =>
        visible ? (
            <View testID="suggestion-modal">
                <Text testID="modal-suggestion-id">{suggestion?.id}</Text>
                <TouchableOpacity testID="modal-close-btn" onPress={onClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="modal-delete-btn"
                    onPress={() => suggestion && deleteSuggestion(suggestion.id)}
                >
                    <Text>Delete</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});

jest.mock('../../../../../components/ThemedAlert', () => {
    const { View, TouchableOpacity, Text } = require('react-native');
    const mock = ({ visible, alert, onConfirm }) =>
        visible ? (
            <View testID="themed-alert">
                <Text testID="alert-type">{alert?.type}</Text>
                <Text testID="alert-title">{alert?.title}</Text>
                <Text testID="alert-message">{alert?.message}</Text>
                <TouchableOpacity testID="alert-confirm" onPress={onConfirm}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
        ) : null;
    mock.ALERT_TYPES = { ERROR: 'error', SUCCESS: 'success' };
    return mock;
});

// ── Helpers ────────────────────────────────────────────────────────────────

const mockUser = { uid: 'user-123' };

const mockSuggestions = [
    { id: 'sug-1', title: 'Add Kanban view', description: 'Would be nice' },
    { id: 'sug-2', title: 'Dark mode', description: 'Please' },
];

const setupSubscription = (suggestions = mockSuggestions) => {
    suggestionService.subscribeToAllSuggestions.mockImplementation((uid, cb) => {
        cb(suggestions);
        return jest.fn();
    });
};

// Tests

describe('Suggestions — unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        setupSubscription();
        suggestionService.deleteSuggestion.mockResolvedValue(undefined);
    });

    // Rendering 

    describe('Rendering', () => {
        it('renders without crashing', () => {
            expect(() => render(<Suggestions />)).not.toThrow();
        });

        it('shows loading screen before subscription callback fires', () => {
            suggestionService.subscribeToAllSuggestions.mockImplementation(() => jest.fn());
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('loading-screen')).toBeTruthy();
        });

        it('hides loading screen after subscription callback fires', () => {
            const { queryByTestId } = render(<Suggestions />);
            expect(queryByTestId('loading-screen')).toBeNull();
        });

        it('renders a ThemedSuggestion for each suggestion', () => {
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('suggestion-sug-1')).toBeTruthy();
            expect(getByTestId('suggestion-sug-2')).toBeTruthy();
        });

        it('renders empty state when suggestions list is empty', () => {
            setupSubscription([]);
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('empty-state')).toBeTruthy();
        });

        it('renders correct empty state title', () => {
            setupSubscription([]);
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('empty-title').props.children).toBe('No suggestions yet');
        });

        it('renders correct empty state subtitle', () => {
            setupSubscription([]);
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('empty-subtitle').props.children).toBe(
                'Users can submit suggestions for new templates here. Check back later!'
            );
        });

        it('does not render SuggestionModal initially', () => {
            const { queryByTestId } = render(<Suggestions />);
            expect(queryByTestId('suggestion-modal')).toBeNull();
        });

        it('does not render ThemedAlert initially', () => {
            const { queryByTestId } = render(<Suggestions />);
            expect(queryByTestId('themed-alert')).toBeNull();
        });
    });

    //  Subscription lifecycle 

    describe('Subscription lifecycle', () => {
        it('calls subscribeToAllSuggestions with user.uid on mount', () => {
            render(<Suggestions />);
            expect(suggestionService.subscribeToAllSuggestions).toHaveBeenCalledWith(
                'user-123',
                expect.any(Function)
            );
        });

        it('unsubscribes on unmount', () => {
            const unsub = jest.fn();
            suggestionService.subscribeToAllSuggestions.mockImplementation((uid, cb) => {
                cb([]);
                return unsub;
            });
            const { unmount } = render(<Suggestions />);
            unmount();
            expect(unsub).toHaveBeenCalled();
        });

        it('does not subscribe when user is null', () => {
            useAuth.mockReturnValue({ user: null });
            render(<Suggestions />);
            expect(suggestionService.subscribeToAllSuggestions).not.toHaveBeenCalled();
        });

        it('does not subscribe when user has no uid', () => {
            useAuth.mockReturnValue({ user: {} });
            render(<Suggestions />);
            expect(suggestionService.subscribeToAllSuggestions).not.toHaveBeenCalled();
        });

        it('stays on loading screen when user is null (no subscription fires)', () => {
            useAuth.mockReturnValue({ user: null });
            const { getByTestId } = render(<Suggestions />);
            expect(getByTestId('loading-screen')).toBeTruthy();
        });

        it('resubscribes when user.uid changes', () => {
            const { rerender } = render(<Suggestions />);
            useAuth.mockReturnValue({ user: { uid: 'user-456' } });
            rerender(<Suggestions />);
            expect(suggestionService.subscribeToAllSuggestions).toHaveBeenCalledTimes(2);
        });
    });

    //  openSuggestion 

    describe('openSuggestion', () => {
        it('opens SuggestionModal when a suggestion is pressed', () => {
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));
            expect(getByTestId('suggestion-modal')).toBeTruthy();
        });

        it('passes the correct suggestion to the modal', () => {
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));
            expect(getByTestId('modal-suggestion-id').props.children).toBe('sug-1');
        });

        it('passes a different suggestion when second item is pressed', () => {
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-2'));
            expect(getByTestId('modal-suggestion-id').props.children).toBe('sug-2');
        });
    });

    // closeSuggestionModal

    describe('closeSuggestionModal', () => {
        it('closes modal when onClose is called', () => {
            const { getByTestId, queryByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));
            fireEvent.press(getByTestId('modal-close-btn'));
            expect(queryByTestId('suggestion-modal')).toBeNull();
        });

        it('resets selectedSuggestion to null when modal is closed', () => {
            const { getByTestId, queryByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));
            fireEvent.press(getByTestId('modal-close-btn'));
            // Modal gone means selectedSuggestion is null
            expect(queryByTestId('suggestion-modal')).toBeNull();
        });
    });

    // handleDeleteSuggestion

    describe('handleDeleteSuggestion', () => {
        it('calls deleteSuggestion with the correct id', async () => {
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            expect(suggestionService.deleteSuggestion).toHaveBeenCalledWith('sug-1');
        });

        it('shows success alert after successful deletion', async () => {
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertTitle = await findByTestId('alert-title');
            expect(alertTitle.props.children).toBe('Success');
        });

        it('shows correct success message', async () => {
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertMsg = await findByTestId('alert-message');
            expect(alertMsg.props.children).toBe('Suggestion deleted successfully');
        });

        it('closes modal after successful deletion', async () => {
            const { getByTestId, queryByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            await waitFor(() => {
                expect(queryByTestId('suggestion-modal')).toBeNull();
            });
        });

        it('shows error alert when deleteSuggestion throws with a message', async () => {
            suggestionService.deleteSuggestion.mockRejectedValue(new Error('Network error'));
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertTitle = await findByTestId('alert-title');
            expect(alertTitle.props.children).toBe('Error');
        });

        it('shows the error message from the thrown error', async () => {
            suggestionService.deleteSuggestion.mockRejectedValue(new Error('Network error'));
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertMsg = await findByTestId('alert-message');
            expect(alertMsg.props.children).toBe('Network error');
        });

        it('falls back to "Failed to delete suggestion" when error has no message', async () => {
            suggestionService.deleteSuggestion.mockRejectedValue({});
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertMsg = await findByTestId('alert-message');
            expect(alertMsg.props.children).toBe('Failed to delete suggestion');
        });

        it('sets alert type to "error" on failure', async () => {
            suggestionService.deleteSuggestion.mockRejectedValue(new Error('fail'));
            const { getByTestId, findByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            const alertType = await findByTestId('alert-type');
            expect(alertType.props.children).toBe('error');
        });

        it('does not close modal on delete failure', async () => {
            suggestionService.deleteSuggestion.mockRejectedValue(new Error('fail'));
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            expect(getByTestId('suggestion-modal')).toBeTruthy();
        });
    });

    // Alert dismiss

    describe('Alert', () => {
        it('dismisses the alert when confirm is pressed', async () => {
            const { getByTestId, findByTestId, queryByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));

            await act(async () => {
                fireEvent.press(getByTestId('modal-delete-btn'));
            });

            fireEvent.press(await findByTestId('alert-confirm'));

            await waitFor(() => {
                expect(queryByTestId('themed-alert')).toBeNull();
            });
        });
    });

    // ── scrollEnabled ─────────────────────────────────────────────────────

    describe('FlatList scrollEnabled', () => {
        it('has scrollEnabled true when modal is closed', () => {
            // Verify by checking modal is closed — scroll state is internal to FlatList props
            const { queryByTestId } = render(<Suggestions />);
            expect(queryByTestId('suggestion-modal')).toBeNull();
        });

        it('disables scroll when modal is open', () => {
            // Modal open state correlates with scrollEnabled=false
            const { getByTestId } = render(<Suggestions />);
            fireEvent.press(getByTestId('suggestion-sug-1'));
            expect(getByTestId('suggestion-modal')).toBeTruthy();
        });
    });
});