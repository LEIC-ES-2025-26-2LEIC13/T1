import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import TaskModal from '../../../components/TaskModal'; // Adjust the import path as needed
import { taskService } from '../../../api/taskService';

// --- Mocks ---

// Mock the API service
jest.mock('../../../api/taskService', () => ({
    taskService: {
        moveTaskToColumn: jest.fn(),
    },
}));

// Mock Constants
jest.mock('../../../constants/Labels', () => ({
    LABELS: [
        { name: 'Bug', icon: 'bug-icon' },
        { name: 'Feature', icon: 'feature-icon' }
    ]
}));

jest.mock('../../../constants/Colors', () => ({
    LabelColors: {
        Bug: '#FF0000',
        default: '#808080'
    }
}));

// Mock Child Components to avoid deep rendering complexities
jest.mock('../../../components/AppModal', () => {
    const { View } = require('react-native');
    return ({ children, visible }) => visible ? <View testID="app-modal">{children}</View> : null;
});

jest.mock('../../../components/modal/ModalHeader', () => {
    const { Pressable } = require('react-native');
    return ({ onClose }) => <Pressable testID="modal-header-close" onPress={onClose} />;
});

jest.mock('../../../components/FormField', () => {
    const { View, Text } = require('react-native');
    return ({ labelName, value }) => (
        <View testID={`form-field-${labelName}`}>
            <Text>{value}</Text>
        </View>
    );
});

jest.mock('../../../components/modal/ModalBody', () => {
    const { View } = require('react-native');
    return ({ children }) => <View>{children}</View>;
});

jest.mock('../../../components/PillsContainer', () => {
    const { View } = require('react-native');
    return ({ children }) => <View>{children}</View>;
});

jest.mock('../../../components/Pill', () => {
    const { View } = require('react-native');
    return ({ projectName, columnName, name }) => (
        <View testID={`pill-${projectName || columnName || name}`} />
    );
});

jest.mock('../../../components/modal/ModalActions', () => {
    const { Pressable, View } = require('react-native');
    return ({ onPrimaryActionPress, onCancel }) => (
        <View>
            <Pressable testID="modal-actions-primary" onPress={onPrimaryActionPress} />
            <Pressable testID="modal-actions-cancel" onPress={onCancel} />
        </View>
    );
});

jest.mock('../../../components/AnimatedPressable', () => {
    const { Pressable } = require('react-native');
    return ({ onPress, children }) => <Pressable onPress={onPress}>{children}</Pressable>;
});

jest.mock('../../../components/ThemedView', () => {
    const { View } = require('react-native');
    return ({ children }) => <View>{children}</View>;
});

jest.mock('../../../components/ThemedText', () => {
    const { Text } = require('react-native');
    return ({ children }) => <Text>{children}</Text>;
});

jest.mock('../../../components/ThemedIcon', () => () => null);
jest.mock('../../../components/Spacer', () => () => null);


// --- Test Suite ---

describe('TaskModal Component', () => {
    const mockOnClose = jest.fn();
    const mockDeleteTask = jest.fn();
    const mockOnTaskMoved = jest.fn();

    const mockColumns = [
        { id: 'col-1', name: 'To Do' },
        { id: 'col-2', name: 'In Progress' },
        { id: 'col-3', name: 'Done' }
    ];

    const baseProps = {
        visible: true,
        projectId: 'proj-123',
        projectName: 'Test Project',
        columnName: 'In Progress',
        columnId: 'col-2', // Middle column
        columns: mockColumns,
        onClose: mockOnClose,
        deleteTask: mockDeleteTask,
        onTaskMoved: mockOnTaskMoved,
        userEmail: 'me@example.com',
        task: {
            id: 'task-1',
            name: 'Fix Bug',
            description: 'This is a nasty bug',
            label: 'Bug',
            assignedMembers: [
                { email: 'me@example.com' },
                { email: 'other@example.com' }
            ]
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render when visible is false', () => {
        render(<TaskModal {...baseProps} visible={false} />);
        expect(screen.queryByTestId('app-modal')).toBeNull();
    });

    it('renders task details correctly', () => {
        render(<TaskModal {...baseProps} />);
        
        expect(screen.getByTestId('app-modal')).toBeTruthy();
        
        // Assert FormField values render the text correctly
        expect(screen.getByText('Fix Bug')).toBeTruthy();
        expect(screen.getByText('This is a nasty bug')).toBeTruthy();
        
        // Assert that the email formatting logic correctly replaces 'me@example.com' with 'Me'
        expect(screen.getByText('Me, other@example.com')).toBeTruthy();

        // Assert Pills
        expect(screen.getByTestId('pill-Test Project')).toBeTruthy();
        expect(screen.getByTestId('pill-In Progress')).toBeTruthy();
        expect(screen.getByTestId('pill-Bug')).toBeTruthy();
    });

    describe('Assigned Members Edge Cases', () => {
        it('renders "No one" when assignedMembers is empty or null', () => {
            const props = { ...baseProps, task: { ...baseProps.task, assignedMembers: [] } };
            render(<TaskModal {...props} />);
            expect(screen.getByText('No one')).toBeTruthy();
        });

        it('renders "No one" when assignedMembers is undefined', () => {
            const props = { ...baseProps, task: { ...baseProps.task, assignedMembers: undefined } };
            render(<TaskModal {...props} />);
            expect(screen.getByText('No one')).toBeTruthy();
        });
    });

    describe('Label Fallback Edge Cases', () => {
        it('renders without label pill if label is missing', () => {
            const props = { ...baseProps, task: { ...baseProps.task, label: null } };
            render(<TaskModal {...props} />);
            // Should not crash, and pill shouldn't exist
            expect(screen.queryByTestId('pill-Bug')).toBeNull();
        });

        it('handles unknown label fallback color gracefully without crashing', () => {
            const props = { ...baseProps, task: { ...baseProps.task, label: 'Unknown' } };
            render(<TaskModal {...props} />);
            expect(screen.getByTestId('pill-Unknown')).toBeTruthy(); // Uses default color internally
        });
    });

    describe('Column Navigation (Move Task)', () => {
        it('shows both previous and next buttons for a middle column', () => {
            render(<TaskModal {...baseProps} columnId="col-2" />);
            expect(screen.getByText('To Do')).toBeTruthy(); // Previous
            expect(screen.getByText('Done')).toBeTruthy();  // Next
        });

        it('shows only NEXT button when in the first column', () => {
            render(<TaskModal {...baseProps} columnId="col-1" />);
            expect(screen.queryByText('To Do')).toBeNull(); // No previous
            expect(screen.getByText('In Progress')).toBeTruthy(); // Next
        });

        it('shows only PREV button when in the last column', () => {
            render(<TaskModal {...baseProps} columnId="col-3" />);
            expect(screen.getByText('In Progress')).toBeTruthy(); // Previous
            expect(screen.queryByText('Done')).toBeNull(); // No next
        });

        it('handles moving task to previous column', async () => {
            render(<TaskModal {...baseProps} columnId="col-2" />);
            const prevButton = screen.getByText('To Do');
            
            fireEvent.press(prevButton);

            await waitFor(() => {
                expect(taskService.moveTaskToColumn).toHaveBeenCalledWith(
                    'proj-123', 
                    baseProps.task, 
                    'col-2', 
                    { id: 'col-1', name: 'To Do' }
                );
                expect(mockOnTaskMoved).toHaveBeenCalled();
            });
        });

        it('handles moving task to next column', async () => {
            render(<TaskModal {...baseProps} columnId="col-2" />);
            const nextButton = screen.getByText('Done');
            
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(taskService.moveTaskToColumn).toHaveBeenCalledWith(
                    'proj-123', 
                    baseProps.task, 
                    'col-2', 
                    { id: 'col-3', name: 'Done' }
                );
                expect(mockOnTaskMoved).toHaveBeenCalled();
            });
        });

        it('does not crash if onTaskMoved is not provided', async () => {
            const props = { ...baseProps, onTaskMoved: undefined };
            render(<TaskModal {...props} />);
            const nextButton = screen.getByText('Done');
            
            fireEvent.press(nextButton);

            await waitFor(() => {
                expect(taskService.moveTaskToColumn).toHaveBeenCalled();
            });
            // Implicitly passing if no error is thrown
        });
    });

    describe('Modal Actions', () => {
        it('calls onClose when header close button or cancel button is pressed', () => {
            render(<TaskModal {...baseProps} />);
            
            fireEvent.press(screen.getByTestId('modal-header-close'));
            expect(mockOnClose).toHaveBeenCalledTimes(1);

            fireEvent.press(screen.getByTestId('modal-actions-cancel'));
            expect(mockOnClose).toHaveBeenCalledTimes(2);
        });

        it('calls deleteTask with correct task when primary action is pressed', () => {
            render(<TaskModal {...baseProps} />);
            
            fireEvent.press(screen.getByTestId('modal-actions-primary'));
            expect(mockDeleteTask).toHaveBeenCalledWith(baseProps.task);
        });
    });
});
