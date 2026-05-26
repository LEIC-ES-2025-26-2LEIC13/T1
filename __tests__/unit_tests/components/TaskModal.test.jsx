import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import TaskModal from "../../../components/TaskModal";

// Mocks

jest.mock("../../../api/taskService", () => ({
    taskService: {
        moveTaskToColumn: jest.fn(),
        updateTask: jest.fn(),
    },
}));

jest.mock("../../../components/AssignMembersSection", () => {
    const React = require("react");
    const { View } = require("react-native");
    return () => <View testID="assign-members-section" />;
});

import { taskService } from "../../../api/taskService";

const mockOnClose = jest.fn();
const mockDeleteTask = jest.fn();
const mockOnTaskMoved = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockTask = {
    id: "task-1",
    name: "Fix bug",
    description: "Fix the login bug",
    label: "Bug",
    assignedMembers: [{ id: "u1", email: "user@example.com" }],
};

const mockColumns = [
    { id: "col-1", name: "To Do" },
    { id: "col-2", name: "In Progress" },
    { id: "col-3", name: "Done" },
];

const defaultProps = {
    visible: true,
    task: mockTask,
    projectName: "My Project",
    columnName: "In Progress",
    onClose: mockOnClose,
    deleteTask: mockDeleteTask,
    projectId: "project-1",
    columns: mockColumns,
    columnId: "col-2",
    onTaskMoved: mockOnTaskMoved,
    userEmail: "user@example.com",
    onChange: mockOnChange,
    getProjectUsers: mockGetProjectUsers,
};

const renderModal = (overrides = {}) =>
    render(<TaskModal {...defaultProps} {...overrides} />);

beforeEach(() => {
    mockOnClose.mockClear();
    mockDeleteTask.mockClear();
    mockOnTaskMoved.mockClear();
    mockOnChange.mockClear();
    mockGetProjectUsers.mockClear();
    taskService.moveTaskToColumn.mockClear();
    taskService.updateTask.mockClear();
});

describe("TaskModal", () => {

    // Rendering

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Task Details")).toBeTruthy();
    });

    test("does not render modal content when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Task Details")).toBeFalsy();
    });

    test("displays task name and description", () => {
        renderModal();

        expect(screen.getByDisplayValue("Fix bug")).toBeTruthy();
        expect(screen.getByDisplayValue("Fix the login bug")).toBeTruthy();
    });

    test("displays project name and column name as pills", () => {
        renderModal();

        expect(screen.getByText("My Project")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("displays label pill when task has a label", () => {
        renderModal();

        expect(screen.getByText("Bug")).toBeTruthy();
    });

    test("displays the hints button in view mode", () => {
        renderModal();

        expect(screen.getByTestId("hints-button")).toBeTruthy();
        expect(screen.getByText("No hints yet. Add hints.")).toBeTruthy();
    });

    test("shows hint availability text when task has hints", () => {
        renderModal({ task: { ...mockTask, hints: "Remember to check the API response." } });

        expect(screen.getByText("See hints")).toBeTruthy();
    });

    test("does not display label pill when task has no label", () => {
        renderModal({ task: { ...mockTask, label: null } });

        expect(screen.queryByText("Bug")).toBeFalsy();
    });

    test("displays assigned member as 'Me' when email matches userEmail", () => {
        renderModal();

        expect(screen.getByDisplayValue("Me")).toBeTruthy();
    });

    test("displays assigned member email when it does not match userEmail", () => {
        renderModal({ userEmail: "other@example.com" });

        expect(screen.getByDisplayValue("user@example.com")).toBeTruthy();
    });

    test("displays 'No one' when task has no assigned members", () => {
        renderModal({ task: { ...mockTask, assignedMembers: [] } });

        expect(screen.getByDisplayValue("No one")).toBeTruthy();
    });

    test("renders Finish Task and Cancel buttons in view mode", () => {
        renderModal();

        expect(screen.getByText("Finish Task")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
    });

    // Column Navigation

    test("renders previous and next column buttons when in a middle column", () => {
        renderModal();

        expect(screen.getByText("To Do")).toBeTruthy();
        expect(screen.getByText("Done")).toBeTruthy();
    });

    test("does not render previous column button on the first column", () => {
        renderModal({ columnId: "col-1" });

        expect(screen.queryByText("To Do")).toBeFalsy();
    });

    test("does not render next column button on the last column", () => {
        renderModal({ columnId: "col-3" });

        expect(screen.queryByText("Done")).toBeFalsy();
    });

    test("calls moveTaskToColumn and onTaskMoved when next column is pressed", async () => {
        taskService.moveTaskToColumn.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByText("Done"));

        await waitFor(() => {
            expect(taskService.moveTaskToColumn).toHaveBeenCalledWith(
                "project-1",
                mockTask,
                "col-2",
                mockColumns[2]
            );
            expect(mockOnTaskMoved).toHaveBeenCalled();
        });
    });

    test("calls moveTaskToColumn and onTaskMoved when previous column is pressed", async () => {
        taskService.moveTaskToColumn.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByText("To Do"));

        await waitFor(() => {
            expect(taskService.moveTaskToColumn).toHaveBeenCalledWith(
                "project-1",
                mockTask,
                "col-2",
                mockColumns[0]
            );
            expect(mockOnTaskMoved).toHaveBeenCalled();
        });
    });

    // View Mode Actions

    test("calls deleteTask with task when Finish Task is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Finish Task"));

        expect(mockDeleteTask).toHaveBeenCalledWith(mockTask);
    });

    test("calls onClose when Cancel is pressed in view mode", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    // Edit Mode

    test("switches to edit mode when pencil button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByText("Task Editing")).toBeTruthy();
    });

    test("renders Save and Cancel buttons in edit mode", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByText("Save")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
    });

    test("pre-populates edit fields with current task values", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByDisplayValue("Fix bug")).toBeTruthy();
        expect(screen.getByDisplayValue("Fix the login bug")).toBeTruthy();
    });

    test("renders AssignMembersSection in edit mode", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByTestId("assign-members-section")).toBeTruthy();
    });

    test("renders label pills in edit mode", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByText("LABELS")).toBeTruthy();
    });

    test("updates task name field in edit mode", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.changeText(screen.getByDisplayValue("Fix bug"), "Fix critical bug");

        expect(screen.getByDisplayValue("Fix critical bug")).toBeTruthy();
    });

    test("updates description field in edit mode", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.changeText(screen.getByDisplayValue("Fix the login bug"), "Fix the signup bug");

        expect(screen.getByDisplayValue("Fix the signup bug")).toBeTruthy();
    });

    test("exits edit mode without saving when Cancel is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByText("Cancel"));

        expect(screen.getByText("Task Details")).toBeTruthy();
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("exits edit mode without saving when pencil button is pressed again", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByText("Task Details")).toBeTruthy();
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("calls updateTask with correct args when Save is pressed", async () => {
        taskService.updateTask.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.changeText(screen.getByDisplayValue("Fix bug"), "Fix critical bug");
        fireEvent.press(screen.getByText("Save"));

        await waitFor(() => {
            expect(taskService.updateTask).toHaveBeenCalledWith(
                "project-1",
                "col-2",
                "task-1",
                expect.objectContaining({ name: "Fix critical bug" })
            );
        });
    });

    test("calls all onChange fields after successful save", async () => {
        taskService.updateTask.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByText("Save"));

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith("name", mockTask.name);
            expect(mockOnChange).toHaveBeenCalledWith("description", mockTask.description);
            expect(mockOnChange).toHaveBeenCalledWith("label", mockTask.label);
            expect(mockOnChange).toHaveBeenCalledWith("assignedMembers", mockTask.assignedMembers);
        });
    });

    test("exits edit mode after successful save", async () => {
        taskService.updateTask.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByText("Save"));

        await waitFor(() => {
            expect(screen.getByText("Task Details")).toBeTruthy();
        });
    });

    test("resets edit state and calls onClose when header close is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByTestId("modal-header-close"));

        expect(mockOnClose).toHaveBeenCalled();
    });
});