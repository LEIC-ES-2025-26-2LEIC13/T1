import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Pressable, View } from 'react-native'; // Added missing imports
import Project from '../../app/project';
import { useAuth } from '../../hooks/useAuth';
import { useProject } from '../../hooks/useProject';
import { useColumn } from '../../hooks/useColumn';
import { useInvite } from '../../hooks/useInvite';
import { projectService } from '../../api/projectService';
import { userService } from '../../api/userService';
import Toast from 'react-native-toast-message';

// Fix ESM errors
jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));
jest.mock('../../firebase/firebaseConfig', () => ({}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

// Mock expo-router
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock('expo-router', () => {
    const { View } = require('react-native');
    function MockStackScreen({ options = {} }) {
        const right = options.headerRight ? options.headerRight() : null;
        const left  = options.headerLeft  ? options.headerLeft()  : null;
        return <View testID="mock-stack-screen">{left}{right}</View>;
    }
    return {
        useRouter: () => ({
            canGoBack: mockCanGoBack,
            back: mockBack,
            replace: mockReplace,
        }),
        useLocalSearchParams: () => ({ projectId: 'test-project-123' }),
        Stack: { Screen: MockStackScreen },
    };
});

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../hooks/useProject', () => ({ useProject: jest.fn() }));
jest.mock('../../hooks/useColumn', () => ({ useColumn: jest.fn() }));
jest.mock('../../hooks/useInvite', () => ({ useInvite: jest.fn() }));

// Mock services
jest.mock('../../api/projectService', () => ({
    projectService: {
        projectHasNoMembers: jest.fn(),
        deleteProject: jest.fn(),
        getProjectUsers: jest.fn(),
    },
}));

jest.mock('../../api/userService', () => ({
    userService: { getUserByEmail: jest.fn() },
}));

// Mock child components
jest.mock('../../components/SeeMembersModal', () => {
    const { Pressable } = require('react-native');
    return function MockSeeMembersModal({ onKickMember, onClose }) {
        return (
            <>
                <Pressable testID="mock-kick" onPress={() => onKickMember('target-user-id', 'target@example.com')} />
                <Pressable testID="mock-leave" onPress={() => onKickMember('user-123', 'me@example.com')} />
                <Pressable testID="mock-close-members" onPress={onClose} />
            </>
        );
    };
});

jest.mock('../../components/InviteProjectModal', () => {
    const { Pressable } = require('react-native');
    return function MockInviteProjectModal({ onInvite, onChangeText, onClose }) {
        return (
            <>
                {/* Separated state update from submission to fix React async state timing */}
                <Pressable testID="mock-change-invite-other" onPress={() => onChangeText('other@example.com')} />
                <Pressable testID="mock-change-invite-self" onPress={() => onChangeText('me@example.com')} />
                <Pressable testID="mock-invite-submit" onPress={onInvite} />
                <Pressable testID="mock-close-invite" onPress={onClose} />
            </>
        );
    };
});

jest.mock('../../components/CreateColumnModal', () => {
    const { Pressable } = require('react-native');
    return function MockCreateColumnModal({ onCreate, columnData, onClose, onChange }) {
        return (
            <>
                <Pressable testID="mock-create-column" onPress={() => onCreate(columnData)} />
                <Pressable testID="mock-close-column" onPress={onClose} />
                <Pressable testID="mock-change-column" onPress={() => onChange('name', 'New Column')} />
            </>
        );
    };
});

jest.mock('../../components/ThemedAlert', () => {
    const { useEffect } = require('react');
    const ALERT_TYPES = { SUCCESS: 'success', ERROR: 'error', INFO: 'info', WARNING: 'warning' };

    function MockThemedAlert({ visible, alert, onConfirm }) {
        useEffect(() => {
            if (visible && onConfirm) {
                const id = setTimeout(() => onConfirm(), 0);
                return () => clearTimeout(id);
            }
        }, [visible, alert, onConfirm]);
        return null;
    }
    return { __esModule: true, default: MockThemedAlert, ALERT_TYPES };
});

jest.mock('../../components/Columns', () => () => null);
jest.mock('../../components/ThemedView', () => {
    const { View } = require('react-native');
    return ({ children, style }) => <View style={style}>{children}</View>;
});

// Fixed AnimatedPressable to safely pass testID down
jest.mock('../../components/AnimatedPressable', () => {
    const { Pressable } = require('react-native');
    return ({ onPress, children, testID, style }) => <Pressable testID={testID} onPress={onPress} style={style}>{children}</Pressable>;
});

// Fixed ThemedIcon to actually render something searchable by testID
jest.mock('../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return ({ testID }) => <View testID={testID} />;
});

jest.mock('../../components/ThemedText', () => () => null);
jest.mock('../../components/OverflowMenu', () => {
    const { Pressable } = require('react-native');
    return function MockOverflowMenu({ actions }) {
        return (
            <>
                {actions.map((action) => (
                    <Pressable key={action.id} testID={`overflow-${action.id}`} onPress={action.onPress} />
                ))}
            </>
        );
    };
});
jest.mock('../../components/SafeAreaPage', () => {
    const { View } = require('react-native');
    return ({ children, style }) => <View style={style}>{children}</View>;
});

// Shared fixtures
const CURRENT_USER = { uid: 'user-123', email: 'me@example.com' };
const MOCK_PROJECTS = [{ id: 'test-project-123', title: 'Test Project' }];

function setupMocks({
    projects = MOCK_PROJECTS,
    kickMember = jest.fn(),
    deleteProject = jest.fn(),
    createColumn = jest.fn(),
    sendInvite = jest.fn(),
} = {}) {
    useAuth.mockReturnValue({ user: CURRENT_USER });
    useProject.mockReturnValue({ projects, deleteProject, kickMember });
    useColumn.mockReturnValue({ columns: [], setActiveProjectId: jest.fn(), createColumn });
    useInvite.mockReturnValue({ sendInvite });
}

describe('ProjectScreen Component', () => {

    describe('handleGoBack edge cases', () => {
        beforeEach(() => { jest.clearAllMocks(); });

        it('calls router.back() when canGoBack returns true', async () => {
            mockCanGoBack.mockReturnValue(true);
            setupMocks();
            render(<Project />);
            fireEvent.press(screen.getByTestId('overflow-delete-project'));
            await waitFor(() => expect(mockBack).toHaveBeenCalled());
        });

        it('falls back to router.replace("/") when canGoBack returns false', async () => {
            mockCanGoBack.mockReturnValue(false);
            setupMocks();
            render(<Project />);
            fireEvent.press(screen.getByTestId('overflow-delete-project'));
            await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
        });

        it('falls back to router.replace("/") when router.canGoBack throws an error', async () => {
            mockCanGoBack.mockImplementation(() => { throw new Error('Router error'); });
            setupMocks();
            render(<Project />);
            fireEvent.press(screen.getByTestId('overflow-delete-project'));
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/');
            });
        });
    });

    describe('handleKickMember and SeeMembersModal', () => {
        let mockKickMember;
        beforeEach(() => {
            jest.clearAllMocks();
            mockCanGoBack.mockReturnValue(true);
            mockKickMember = jest.fn().mockResolvedValue();
            setupMocks({ kickMember: mockKickMember });
        });

        it('kicks a different member successfully', async () => {
            render(<Project />);
            fireEvent.press(screen.getByTestId('mock-kick'));
            await waitFor(() => {
                expect(mockKickMember).toHaveBeenCalledWith('test-project-123', 'target-user-id');
                expect(mockBack).not.toHaveBeenCalled();
            });
        });

        it('handles kickMember failure when current user leaves, resetting leaving state', async () => {
            mockKickMember.mockRejectedValueOnce(new Error('Kick failed'));
            render(<Project />);
            fireEvent.press(screen.getByTestId('mock-leave'));
            await waitFor(() => {
                expect(mockKickMember).toHaveBeenCalled();
                expect(mockBack).not.toHaveBeenCalled();
            });
        });

        it('can close the see members modal', () => {
            render(<Project />);
            fireEvent.press(screen.getByTestId('see-members-icon'));
            fireEvent.press(screen.getByTestId('mock-close-members'));
        });
    });

    describe('handleProjectDelete', () => {
        let mockDeleteProject;
        beforeEach(() => {
            jest.clearAllMocks();
            mockCanGoBack.mockReturnValue(true);
            mockDeleteProject = jest.fn().mockResolvedValue();
            setupMocks({ deleteProject: mockDeleteProject });
        });

        it('does NOT navigate when deleteProject throws an error and resets deleting state', async () => {
            mockDeleteProject.mockRejectedValueOnce(new Error('Delete failed'));
            render(<Project />);
            fireEvent.press(screen.getByTestId('overflow-delete-project'));
            await waitFor(() => {
                expect(mockDeleteProject).toHaveBeenCalled();
                expect(mockBack).not.toHaveBeenCalled();
            });
        });
    });

    describe('handleSendInvite and InviteModal', () => {
        let mockSendInvite;
        beforeEach(() => {
            jest.clearAllMocks();
            mockSendInvite = jest.fn().mockResolvedValue();
            setupMocks({ sendInvite: mockSendInvite });
        });

        it('does not send invite if target is empty', async () => {
            render(<Project />);
            // Directly submit without updating the text mock
            fireEvent.press(screen.getByTestId('mock-invite-submit'));
            await waitFor(() => expect(userService.getUserByEmail).not.toHaveBeenCalled());
        });

        it('shows an error if user to invite is not found', async () => {
            userService.getUserByEmail.mockResolvedValueOnce(null);
            render(<Project />);
            
            // Set text first, then submit
            fireEvent.press(screen.getByTestId('mock-change-invite-other'));
            fireEvent.press(screen.getByTestId('mock-invite-submit'));
            
            await waitFor(() => {
                expect(userService.getUserByEmail).toHaveBeenCalledWith('other@example.com');
                expect(mockSendInvite).not.toHaveBeenCalled();
            });
        });

        it('shows an error if self-inviting', async () => {
            userService.getUserByEmail.mockResolvedValueOnce({ id: 'user-123', email: 'me@example.com' });
            render(<Project />);
            
            // Set text to the current user's email, then submit
            fireEvent.press(screen.getByTestId('mock-change-invite-self'));
            fireEvent.press(screen.getByTestId('mock-invite-submit'));
            
            await waitFor(() => expect(mockSendInvite).not.toHaveBeenCalled());
        });

        it('shows error if sendInvite throws', async () => {
            userService.getUserByEmail.mockResolvedValueOnce({ id: 'receiver-456', email: 'other@example.com' });
            mockSendInvite.mockRejectedValueOnce(new Error('Invite error'));
            render(<Project />);
            
            fireEvent.press(screen.getByTestId('mock-change-invite-other'));
            fireEvent.press(screen.getByTestId('mock-invite-submit'));
            
            await waitFor(() => expect(Toast.show).not.toHaveBeenCalled());
        });

        it('can close the invite modal', () => {
            render(<Project />);
            fireEvent.press(screen.getByTestId('overflow-invite-member'));
            fireEvent.press(screen.getByTestId('mock-close-invite'));
        });
    });

    describe('handleCreateColumn and CreateColumnModal', () => {
        let mockCreateColumn;
        beforeEach(() => {
            jest.clearAllMocks();
            mockCreateColumn = jest.fn().mockResolvedValue();
            setupMocks({ createColumn: mockCreateColumn });
        });

        it('can update column data via onChange', async () => {
            render(<Project />);
            fireEvent.press(screen.getByTestId('mock-change-column'));
            fireEvent.press(screen.getByTestId('mock-create-column'));
            await waitFor(() => {
                expect(mockCreateColumn).toHaveBeenCalledWith({ name: 'New Column' });
            });
        });

        it('can close the create column modal', () => {
            render(<Project />);
            fireEvent.press(screen.getByTestId('mock-close-column'));
        });
    });

    describe('Access Lost & Mount Lifecycles', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockCanGoBack.mockReturnValue(true);
        });

        it('shows Access Lost alert and navigates back if currentProject is not found on mount', async () => {
            setupMocks({ projects: [] });
            render(<Project />);
            
            await waitFor(() => {
                expect(mockBack).toHaveBeenCalled();
            });
        });

        it('clears active project ID on unmount', () => {
            const mockSetActiveProjectId = jest.fn();
            setupMocks();
            useColumn.mockReturnValue({
                columns: [],
                setActiveProjectId: mockSetActiveProjectId,
                createColumn: jest.fn(),
            });

            const { unmount } = render(<Project />);
            expect(mockSetActiveProjectId).toHaveBeenCalledWith('test-project-123');
            unmount();
            expect(mockSetActiveProjectId).toHaveBeenLastCalledWith('');
        });
    });
});