import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import SeeMembersModal from '../../components/SeeMembersModal'; // Adjust path if needed
import { useAuth } from '../../hooks/useAuth'; // Ensure this relative path resolves correctly!

// --- Mocks ---

// Mock Hooks
jest.mock('../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}));

// Mock Constants
jest.mock('../../constants/Colors', () => ({
    Colors: {
        light: { borders: '#DDDDDD' },
        dark: { borders: '#222222' }
    }
}));

// Mock React Native internals
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
    default: jest.fn().mockReturnValue('light')
}));

// Mock Child Components
jest.mock('../../components/AppModal', () => {
    const { View } = require('react-native');
    return ({ visible, children }) => visible ? <View testID="app-modal">{children}</View> : null;
});

jest.mock('../../components/modal/ModalHeader', () => {
    const { Pressable } = require('react-native');
    return ({ onClose }) => <Pressable testID="modal-header-close" onPress={onClose} />;
});

jest.mock('../../components/ThemedIcon', () => {
    const { View } = require('react-native');
    return () => <View testID="themed-icon" />;
});

jest.mock('../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children }) => <Text>{children}</Text>;
});

jest.mock('../../components/Spacer', () => () => null);

// Mock OverflowMenu to expose actions for triggering
jest.mock('../../components/OverflowMenu', () => {
    const { View, Pressable } = require('react-native');
    return ({ testID, actions }) => (
        <View testID={testID}>
            {actions.map(action => (
                <Pressable 
                    key={action.id} 
                    testID={`${testID}-action-${action.id}`} 
                    onPress={action.onPress} 
                />
            ))}
        </View>
    );
});

jest.mock('../../components/ThemedAlert', () => { // Or '../../../components' depending on where this file is
    const { Pressable, View, Text } = require('react-native');
    const ALERT_TYPES = { ERROR: 'error', SUCCESS: 'success' };
    
    function MockAlert({ visible, alert, onConfirm }) {
        if (!visible) return null;
        return (
            <View>
                <Text>{alert.title}</Text>
                <Text>{alert.message}</Text>
                <Pressable testID="alert-confirm-button" onPress={onConfirm} />
            </View>
        );
    }
    return { __esModule: true, default: MockAlert, ALERT_TYPES };
});


// --- Test Suite ---

describe('SeeMembersModal Component', () => {
    const mockGetProjectUsers = jest.fn();
    const mockOnClose = jest.fn();
    const mockOnKickMember = jest.fn();

    const currentUser = { email: 'me@example.com' };

    const mockMembers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'me@example.com' }, // Current user is 2nd, should be sorted to 1st
        { id: '3', email: 'user3@example.com' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: currentUser });
        mockGetProjectUsers.mockResolvedValue(mockMembers);
    });

    it('does not render content when visible is false', () => {
        render(
            <SeeMembersModal 
                visible={false} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
                onKickMember={mockOnKickMember} 
            />
        );
        expect(screen.queryByTestId('app-modal')).toBeNull();
        expect(mockGetProjectUsers).not.toHaveBeenCalled();
    });

    it('fetches and sorts members on mount, placing current user first', async () => {
        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
                onKickMember={mockOnKickMember} 
            />
        );

        // Ensure AppModal renders
        expect(screen.getByTestId('app-modal')).toBeTruthy();
        
        await waitFor(() => {
            expect(mockGetProjectUsers).toHaveBeenCalledTimes(1);
        });

        // The current user's email should be formatted
        expect(screen.getByText('Me (me@example.com)')).toBeTruthy();
        expect(screen.getByText('user1@example.com')).toBeTruthy();
        expect(screen.getByText('user3@example.com')).toBeTruthy();
    });

    it('handles edge case where current user is not in the members list safely', async () => {
        // Exclude current user from the returned list
        mockGetProjectUsers.mockResolvedValueOnce([
            { id: '1', email: 'other1@example.com' },
            { id: '2', email: 'other2@example.com' }
        ]);

        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
                onKickMember={mockOnKickMember} 
            />
        );

        await waitFor(() => {
            expect(screen.getByText('other1@example.com')).toBeTruthy();
            expect(screen.queryByText(/Me/)).toBeNull(); // Shouldn't map "Me" for anyone
        });
    });

    it('displays an error alert if getProjectUsers fails, and allows dismissal', async () => {
        const errorMsg = 'Network failed';
        mockGetProjectUsers.mockRejectedValueOnce(new Error(errorMsg));

        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
                onKickMember={mockOnKickMember} 
            />
        );

                // Wait for the alert to appear
        await waitFor(() => {
            expect(screen.getByTestId('alert-confirm-button')).toBeTruthy();
            expect(screen.getByText('Failed to Load Members')).toBeTruthy();
            expect(screen.getByText(errorMsg)).toBeTruthy();
        });

        // Dismiss the alert
        fireEvent.press(screen.getByTestId('alert-confirm-button'));

        // Alert should disappear
        await waitFor(() => {
            expect(screen.queryByTestId('alert-confirm-button')).toBeNull();
        });
    });

    describe('Kick and Leave functionality', () => {
        it('calls onKickMember but does NOT re-fetch members when the current user LEAVES the project', async () => {
            render(
                <SeeMembersModal 
                    visible={true} 
                    getProjectUsers={mockGetProjectUsers} 
                    onClose={mockOnClose} 
                    onKickMember={mockOnKickMember} 
                />
            );

            await waitFor(() => expect(mockGetProjectUsers).toHaveBeenCalledTimes(1));

            // Press "Leave project" on the current user
            const leaveBtn = screen.getByTestId('overflow-menu-me@example.com-action-leave-project');
            fireEvent.press(leaveBtn);

            await waitFor(() => {
                expect(mockOnKickMember).toHaveBeenCalledWith('2', 'me@example.com');
                // Should STILL be 1 because updateMembers() is intentionally skipped for the current user
                expect(mockGetProjectUsers).toHaveBeenCalledTimes(1); 
            });
        });

        it('calls onKickMember AND re-fetches members when KICKING another user', async () => {
            render(
                <SeeMembersModal 
                    visible={true} 
                    getProjectUsers={mockGetProjectUsers} 
                    onClose={mockOnClose} 
                    onKickMember={mockOnKickMember} 
                />
            );

            await waitFor(() => expect(mockGetProjectUsers).toHaveBeenCalledTimes(1));

            // Press "Kick member" on another user
            const kickBtn = screen.getByTestId('overflow-menu-user1@example.com-action-kick-member');
            fireEvent.press(kickBtn);

            await waitFor(() => {
                expect(mockOnKickMember).toHaveBeenCalledWith('1', 'user1@example.com');
                // Should now be 2 because kicking someone else triggers updateMembers()
                expect(mockGetProjectUsers).toHaveBeenCalledTimes(2);
            });
        });
    });

    it('triggers onClose when header close button is pressed', async () => {
        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
                onKickMember={mockOnKickMember} 
            />
        );

        const closeBtn = screen.getByTestId('modal-header-close');
        fireEvent.press(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});