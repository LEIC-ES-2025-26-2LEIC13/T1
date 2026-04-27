import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SeeMembersModal from '../../components/SeeMembersModal';
import { useAuth } from '../../hooks/useAuth';

// Mock firebase because of unexpected token issues with jest
jest.mock('firebase/auth', () => ({}));
jest.mock('../../firebase/firebaseConfig', () => ({}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

describe('SeeMembersModal Integration Tests', () => {
    // Fake current user
    const mockCurrentUser = { email: 'me@example.com' };
    
    // Fake project returned by the prop
    const mockProjectUsers = [
        { id: '1', email: 'alice@example.com' },
        { id: '2', email: 'me@example.com' }, // Current user
        { id: '3', email: 'bob@example.com' }
    ];

    let mockGetProjectUsers;
    let mockOnClose;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        useAuth.mockReturnValue({ user: mockCurrentUser });
        mockGetProjectUsers = jest.fn().mockReturnValue(mockProjectUsers);
        mockOnClose = jest.fn();
    });

    it('renders correctly and fetches members when visible is true', async () => {
        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
            />
        );

        // Verify the function was called
        expect(mockGetProjectUsers).toHaveBeenCalledTimes(1);

        // Wait for the async useEffect to finish and populate the FlatList
        // findByText automatically waits for the element to appear
        const currentUserElement = await screen.findByText('Me (me@example.com)');
        expect(currentUserElement).toBeTruthy();

        // Check if other users are rendered properly
        expect(screen.getByText('alice@example.com')).toBeTruthy();
        expect(screen.getByText('bob@example.com')).toBeTruthy();
    });

    it('handles the onClose button press', async () => {
        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
            />
        );

        // Wait for the async useEffect to finish
        await screen.findByText('Me (me@example.com)');

        // Finding the close button using testID (which I will add to SeeMembersModal.jsx now)
        const closeBtn = screen.getByTestId('see-members-close');
        fireEvent.press(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('throws an error/handles it gracefully if current user is not in the project (integration)', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn()); // empty implementato
        mockGetProjectUsers.mockReturnValue([{ id: '1', email: 'someone@example.com' }]);

        render(
            <SeeMembersModal 
                visible={true} 
                getProjectUsers={mockGetProjectUsers} 
                onClose={mockOnClose} 
            />
        );

        // Expect it to be caught by the try-catch block in SeeMembersModal
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('The current user does not belong to this project');
        });

        consoleSpy.mockRestore();
    });
})
