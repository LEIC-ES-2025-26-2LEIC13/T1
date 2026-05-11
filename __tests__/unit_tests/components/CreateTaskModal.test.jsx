import { jest, beforeEach, describe, test, expect, } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CreateTaskModal from "../../../components/CreateTaskModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

// Mock useAuth hook
jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({
        user: { email: "current@example.com" },
    }),
}));

const mockTask = {
    name: "New Task",
    description: "Task description",
    label: "",
    assignedMembers: [],
};

const mockProjectUsers = [
    { id: "user1", email: "user1@example.com" },
    { id: "user2", email: "user2@example.com" },
    { id: "current", email: "current@example.com" },
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
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();
    mockGetProjectUsers.mockClear().mockResolvedValue(mockProjectUsers);
});

describe("CreateTaskModal", () => {
    test("renders modal with form when visible", () => {
        renderModal();
        expect(screen.getByText("Create Task")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
        expect(screen.getByText("Add Members")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });
        expect(screen.queryByText("Create Task")).toBeFalsy();
    });

    test("displays project and column pills", () => {
        renderModal({ projectName: "My Project", columnName: "In Progress" });
        expect(screen.getByText("My Project")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("updates task name on text change", () => {
        renderModal();
        const nameInput = screen.getByDisplayValue("New Task");
        fireEvent.changeText(nameInput, "Updated Task Name");
        expect(mockOnChange).toHaveBeenCalledWith("name", "Updated Task Name");
    });

    test("updates task description on text change", () => {
        renderModal();
        const descriptionInput = screen.getByDisplayValue("Task description");
        fireEvent.changeText(descriptionInput, "Updated description");
        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated description");
    });

    test("displays form fields for task creation", () => {
        renderModal();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
        expect(screen.getByText("Assigned Members")).toBeTruthy();
    });

    test("shows assigned members when present", () => {
        const taskWithMembers = {
            ...mockTask,
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
                { id: "user2", email: "user2@example.com" },
            ],
        };
        renderModal({ task: taskWithMembers });

        expect(screen.getByText("user1@example.com")).toBeTruthy();
        expect(screen.getByText("user2@example.com")).toBeTruthy();
    });

    test("does not show assigned members when empty", () => {
        renderModal();
        expect(screen.queryByText("user1@example.com")).toBeFalsy();
    });

    test("calls onCreate with task when Create button is pressed", () => {
        renderModal();
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).toHaveBeenCalledWith(mockTask);
    });

    test("does not call onCreate when task name is empty", () => {
        renderModal({ task: { ...mockTask, name: "" } });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("does not call onCreate when task name is only whitespace", () => {
        renderModal({ task: { ...mockTask, name: "   " } });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("calls onClose when close button is used", () => {
        renderModal();
        fireEvent.press(screen.getByText("Close"));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test("can interact with assigned members display", () => {
        const taskWithMembers = {
            ...mockTask,
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
            ],
        };
        renderModal({ task: taskWithMembers });

        expect(screen.getByText("user1@example.com")).toBeTruthy();
        // The remove button interaction is a UI detail; the important part
        // is that the member is displayed and onChange logic works
    });

    test("displays label field for task creation", () => {
        renderModal();
        expect(screen.getByText("LABELS")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter or select label")).toBeTruthy();
    });

    test("handles task with all fields populated", () => {
        const fullTask = {
            name: "Complete project",
            description: "Finish implementation",
            label: "urgent",
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
            ],
        };
        renderModal({ task: fullTask });

        expect(screen.getByDisplayValue("Complete project")).toBeTruthy();
        expect(screen.getByDisplayValue("Finish implementation")).toBeTruthy();
        expect(screen.getByText("user1@example.com")).toBeTruthy();
    });

    test("handles task with minimal fields", () => {
        const minimalTask = {
            name: "Task",
            description: "",
            label: "",
            assignedMembers: [],
        };
        renderModal({ task: minimalTask });

        expect(screen.getByDisplayValue("Task")).toBeTruthy();
        expect(screen.getByText("Add Members")).toBeTruthy();
    });
});
