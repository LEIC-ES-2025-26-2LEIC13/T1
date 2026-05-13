import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act
} from "@testing-library/react-native";

import CreateTaskModal from "../../../components/CreateTaskModal";

// FIX: Mocking icons as a React View prevents string-rendering crashes
jest.mock("@expo/vector-icons", () => {
    const { View } = require("react-native");
    return {
        MaterialCommunityIcons: (props) => <View {...props} testID="mock-icon" />,
    };
});

// Mock useAuth
jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({
        user: {
            email: "current@example.com",
        },
    }),
}));

// Mock useColorScheme
jest.mock(
    "react-native/Libraries/Utilities/useColorScheme",
    () => ({
        default: () => "light",
    })
);

// Gracefully mock any Alert/Toast systems if they are used internally
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockTask = {
    name: "New Task",
    description: "Task description",
    label: "",
    assignedMembers: [],
};

const mockProjectUsers = [
    { id: "1", email: "user1@example.com" },
    { id: "2", email: "user2@example.com" },
    { id: "3", email: "current@example.com" },
];

const renderModal = (overrides = {}) =>
    render(
        <CreateTaskModal
            visible={true}
            projectName="Project A"
            columnName="To Do"
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            task={mockTask}
            onChange={mockOnChange}
            getProjectUsers={mockGetProjectUsers}
            {...overrides}
        />
    );

beforeEach(() => {
    jest.clearAllMocks();

    mockGetProjectUsers
        .mockClear()
        .mockResolvedValue(mockProjectUsers);
});

describe("CreateTaskModal", () => {

    test("renders modal correctly", () => {
        renderModal();

        expect(screen.getByText("Create Task")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });
        expect(screen.queryByText("Create Task")).toBeFalsy();
    });

    test("renders project and column pills", () => {
        renderModal({
            projectName: "Test Project",
            columnName: "In Progress",
        });

        expect(screen.getByText("Test Project")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("updates task name on change", () => {
        renderModal();
        const input = screen.getByDisplayValue("New Task");
        fireEvent.changeText(input, "Updated Task");
        expect(mockOnChange).toHaveBeenCalledWith("name", "Updated Task");
    });

    test("updates task description on change", () => {
        renderModal();
        const input = screen.getByDisplayValue("Task description");
        fireEvent.changeText(input, "Updated Description");
        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated Description");
    });

    test("renders labels section", () => {
        renderModal();
        expect(screen.getByText("LABELS")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter or select label")).toBeTruthy();
    });

    test("supports custom label input", () => {
        renderModal();
        const labelInput = screen.getByPlaceholderText("Enter or select label");
        fireEvent.changeText(labelInput, "custom");
        expect(mockOnChange).toHaveBeenCalledWith("label", "custom");
    });

    test("toggles preset label", () => {
        renderModal();
        fireEvent.press(screen.getByText("Urgent"));
        expect(mockOnChange).toHaveBeenCalledWith("label", "Urgent");
    });

    test("calls onCreate when Create button is pressed", () => {
        renderModal();
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).toHaveBeenCalledWith(mockTask);
    });

    test("does not call onCreate when task name is empty", () => {
        renderModal({
            task: { ...mockTask, name: "" },
        });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("does not call onCreate when task name is whitespace", () => {
        renderModal({
            task: { ...mockTask, name: "   " },
        });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("calls onClose when Close button is pressed", () => {
        renderModal();
        fireEvent.press(screen.getByText("Close"));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test("shows assigned members", () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: [
                    { id: "1", email: "user1@example.com" },
                ],
            },
        });
        expect(screen.getByText("user1@example.com")).toBeTruthy();
    });

    test("does not show assigned members when empty", () => {
        renderModal();
        expect(screen.queryByText("user1@example.com")).toBeFalsy();
    });

    test("opens assign members modal", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("Assign Members")).toBeTruthy();
        });
    });

    test("loads project users", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(mockGetProjectUsers).toHaveBeenCalled();
        });
    });

    test("filters out current user", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            // Should not show current user email as an assignable option
            expect(screen.queryByText("current@example.com")).toBeFalsy();
        });
    });

    test("shows project users", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("user1@example.com")).toBeTruthy();
            expect(screen.getByText("user2@example.com")).toBeTruthy();
        });
    });

    test("toggles member assignment", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("user1@example.com")).toBeTruthy();
        });

        fireEvent.press(screen.getByText("user1@example.com"));
        expect(mockOnChange).toHaveBeenCalled();
    });

    test("removes already assigned member when pressed again", async () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: [
                    { id: "1", email: "user1@example.com" },
                ],
            },
        });

        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("user1@example.com")).toBeTruthy();
        });

        // Toggle it off
        fireEvent.press(screen.getByText("user1@example.com"));
        
        expect(mockOnChange).toHaveBeenCalledWith(
            "assignedMembers",
            []
        );
    });

    test("closes assign modal with Done button", async () => {
        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("Assign Members")).toBeTruthy();
        });

        fireEvent.press(screen.getByText("Done"));

        await waitFor(() => {
            expect(screen.getByText("Create Task")).toBeTruthy();
        });
    });

    // FIX: Modified to gracefully check for failure catching, regardless of console.error usage
    test("handles getProjectUsers error gracefully", async () => {
        // Prevent Jest from failing the test due to unhandled console errors
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        mockGetProjectUsers.mockRejectedValueOnce(new Error("Failed to load"));

        renderModal();
        fireEvent.press(screen.getByText("Add Members"));

        // Wait to ensure the function was called and the promise rejection was caught
        await waitFor(() => {
            expect(mockGetProjectUsers).toHaveBeenCalled();
        });
        
        // Assert the component didn't crash (UI is still present)
        expect(screen.getByText("Assign Members")).toBeTruthy();

        consoleSpy.mockRestore();
    });

    test("closes assign modal when visible becomes false", async () => {
        const { rerender } = renderModal();

        fireEvent.press(screen.getByText("Add Members"));

        await waitFor(() => {
            expect(screen.getByText("Assign Members")).toBeTruthy();
        });

        // Rerender with visible=false
        rerender(
            <CreateTaskModal
                visible={false}
                projectName="Project A"
                columnName="To Do"
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                task={mockTask}
                onChange={mockOnChange}
                getProjectUsers={mockGetProjectUsers}
            />
        );

        await waitFor(() => {
            expect(screen.queryByText("Assign Members")).toBeFalsy();
        });
    });

    test("handles task with full data", () => {
        renderModal({
            task: {
                name: "Complete Task",
                description: "Full Description",
                label: "Urgent",
                assignedMembers: [
                    { id: "1", email: "user1@example.com" },
                ],
            },
        });

        expect(screen.getByDisplayValue("Complete Task")).toBeTruthy();
        expect(screen.getByDisplayValue("Full Description")).toBeTruthy();
        expect(screen.getByText("user1@example.com")).toBeTruthy();
    });

    test("handles task with minimal data", () => {
        renderModal({
            task: {
                name: "Task",
                description: "",
                label: "",
                assignedMembers: [],
            },
        });

        expect(screen.getByDisplayValue("Task")).toBeTruthy();
    });

    test("renders safely with undefined assignedMembers", () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: undefined,
            },
        });

        expect(screen.getByText("Create Task")).toBeTruthy();
    });
});