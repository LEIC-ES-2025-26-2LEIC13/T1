import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Project from '../../app/project';
import { useAuth } from '../../hooks/useAuth';
import { useProject } from '../../hooks/useProject';
import { useInvite } from '../../hooks/useInvite';
import { useTask } from '../../hooks/useTask';
import { projectService } from '../../api/projectService';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Fix ESM errors
jest.mock('firebase/auth', () => ({}));
jest.mock('firebase/firestore', () => ({}));
jest.mock('../../firebase/firebaseConfig', () => ({}));

// Mock dependencies
jest.mock('expo-router', () => {
    const mockBack = jest.fn();
    const mockReplace = jest.fn();
    return {
        useRouter: () => ({
            canGoBack: () => true,
            back: mockBack,
            replace: mockReplace,
        }),
        useLocalSearchParams: () => ({ projectId: 'test-project-123' }),
        Stack: {
            Screen: () => null,
        },
    };
});

jest.mock('../../hooks/useAuth', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../hooks/useProject', () => ({
    useProject: jest.fn()
}));

jest.mock('../../hooks/useInvite', () => ({
    useInvite: jest.fn()
}));

jest.mock('../../hooks/useTask', () => ({
    useTask: jest.fn()
}));

jest.mock('../../api/projectService', () => ({
    projectService: {
        projectHasNoMembers: jest.fn(),
        deleteProject: jest.fn()
    }
}));

// Mock child components
jest.mock('../../components/SeeMembersModal', () => {
    const { Pressable, Text } = require('react-native');
    return function MockSeeMembersModal({ onKickMember }) {
        return (
            <>
                <Pressable
                    testID="mock-kick"
                    onPress={() => onKickMember('target-user-id', 'target@example.com')}
                >
                </Pressable>
                <Pressable
                    testID="mock-leave"
                    onPress={() => onKickMember('user-123', 'me@example.com')}
                >
                </Pressable>
            </>
        );
    };
});

const mockProjects = [
    { id: 'test-project-123', title: 'Test Project' }
];



describe('handleKickMember Unit Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => { }); // targets the alert method of the Alert object and replaces it with a mock function that does nothing, allowing to test if it was called without actually showing an alert

        useAuth.mockReturnValue({
            user: { uid: 'user-123', email: 'me@example.com' }
        });

        useProject.mockReturnValue({
            projects: mockProjects,
            deleteProject: jest.fn(),
            kickMember: jest.fn()
        });

        useInvite.mockReturnValue({
            sendInvite: jest.fn()
        });

        useTask.mockReturnValue({
            tasks: [],
            createTask: jest.fn(),
            deleteTask: jest.fn(),
            setActiveProjectId: jest.fn()
        });
    });

    it('should kick a different member and show success alert', async () => {

        render(<Project />);

        // Simulate kicking 'target-user-id' (see MockSeeMembersModal)
        fireEvent.press(screen.getByTestId('mock-kick'));

        await waitFor(() => { // Wait for async operations to complete
            // Check the following expectations

            expect(useProject().kickMember).toHaveBeenCalledWith('test-project-123', 'target-user-id');
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Successfully kicked target@example.com.'); // predefined alert message

            // Ensure navigate away is not called
            const router = useRouter();
            expect(router.back).not.toHaveBeenCalled();
            expect(router.replace).not.toHaveBeenCalled();
            expect(projectService.projectHasNoMembers).not.toHaveBeenCalled(); // project is not expected to be deleted when kicking other members
        });
    });

    it('should allow user to leave project and not delete project if there are members', async () => {
        projectService.projectHasNoMembers.mockResolvedValueOnce(false); // Resolve the promise returned by projectHasNoMembers to simulate a project with members left

        render(<Project />);

        // Simulate leaving project (see MockSeeMembersModal)
        fireEvent.press(screen.getByTestId('mock-leave'));

        await waitFor(() => { // Wait for async operations to complete
            // Check the following expectations
            expect(useProject().kickMember).toHaveBeenCalledWith('test-project-123', 'user-123');
            expect(projectService.projectHasNoMembers).toHaveBeenCalledWith('test-project-123');
            expect(projectService.deleteProject).not.toHaveBeenCalled();

            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Successfully left the project.');
        });
    });

    it('should allow user to leave project and delete project if there are NO members', async () => {
        projectService.projectHasNoMembers.mockResolvedValueOnce(true); // No members left
        projectService.deleteProject.mockResolvedValueOnce(); // Resolve the promise with no value to simulate a successful operation

        render(<Project />);

        // Simulate leaving project
        fireEvent.press(screen.getByTestId('mock-leave'));

        await waitFor(() => {
            expect(useProject().kickMember).toHaveBeenCalledWith('test-project-123', 'user-123');
            expect(projectService.projectHasNoMembers).toHaveBeenCalledWith('test-project-123');
            expect(projectService.deleteProject).toHaveBeenCalledWith('test-project-123');

            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Successfully left the project.');
        });
    });
});
