import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import TemplateTaskModal from "../../../components/TemplateTaskModal";

jest.mock("../../../api/templateColumnService", () => ({
    templateColumnService: {
        moveTaskToColumn: jest.fn(),
        updateTask: jest.fn(),
        getTask: jest.fn(),
    },
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (cb) => cb(),
}));

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    default: () => "light",
}));

import { templateColumnService } from "../../../api/templateColumnService";

const mockOnClose = jest.fn();
const mockDeleteTask = jest.fn();
const mockOnTaskMoved = jest.fn();
const mockOnChange = jest.fn();

const mockTask = {
    id: "task-1",
    name: "Fix bug",
    description: "Fix the login bug",
    hints: null,
};

const mockColumns = [
    { id: "col-1", name: "To Do" },
    { id: "col-2", name: "In Progress" },
    { id: "col-3", name: "Done" },
];

const defaultProps = {
    visible: true,
    task: mockTask,
    templateName: "My Template",
    columnName: "In Progress",
    onClose: mockOnClose,
    deleteTask: mockDeleteTask,
    templateId: "template-1",
    columns: mockColumns,
    columnId: "col-2",
    onTaskMoved: mockOnTaskMoved,
    userEmail: "user@example.com",
    onChange: mockOnChange,
};

const renderModal = (overrides = {}) =>
    render(<TemplateTaskModal {...defaultProps} {...overrides} />);

beforeEach(() => {
    mockOnClose.mockClear();
    mockDeleteTask.mockClear();
    mockOnTaskMoved.mockClear();
    mockOnChange.mockClear();
    templateColumnService.moveTaskToColumn.mockClear();
    templateColumnService.updateTask.mockClear();
    templateColumnService.getTask.mockResolvedValue(null);
});

describe("TemplateTaskModal", () => {

    // Rendering

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Task Details")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Task Details")).toBeFalsy();
    });

    test("displays task name and description", () => {
        renderModal();

        expect(screen.getByDisplayValue("Fix bug")).toBeTruthy();
        expect(screen.getByDisplayValue("Fix the login bug")).toBeTruthy();
    });

    test("displays template name and column name as pills", () => {
        renderModal();

        expect(screen.getByText("My Template")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("renders Finish Task and Cancel buttons in view mode", () => {
        renderModal();

        expect(screen.getByText("Finish Task")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
    });

    test("renders hints button with 'No hints yet' when task has no hints", () => {
        renderModal();

        expect(screen.getByText("No hints yet. Add hints.")).toBeTruthy();
    });

    test("renders hints button with 'See hints' when task has hints", () => {
        renderModal({ task: { ...mockTask, hints: ["Hint 1"] } });

        expect(screen.getByText("See hints")).toBeTruthy();
    });

    // Column Navigation

    test("renders previous and next column buttons in a middle column", () => {
        renderModal();

        expect(screen.getByTestId("move-task-prev-column-button")).toBeTruthy();
        expect(screen.getByTestId("move-task-next-column-button")).toBeTruthy();
    });

    test("does not render previous column button on the first column", () => {
        renderModal({ columnId: "col-1" });

        expect(screen.queryByTestId("move-task-prev-column-button")).toBeFalsy();
    });

    test("does not render next column button on the last column", () => {
        renderModal({ columnId: "col-3" });

        expect(screen.queryByTestId("move-task-next-column-button")).toBeFalsy();
    });

    test("calls moveTaskToColumn and onTaskMoved when next column is pressed", async () => {
        templateColumnService.moveTaskToColumn.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("move-task-next-column-button"));

        await waitFor(() => {
            expect(templateColumnService.moveTaskToColumn).toHaveBeenCalledWith(
                "template-1",
                mockTask,
                "col-2",
                mockColumns[2]
            );
            expect(mockOnTaskMoved).toHaveBeenCalled();
        });
    });

    test("calls moveTaskToColumn and onTaskMoved when previous column is pressed", async () => {
        templateColumnService.moveTaskToColumn.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("move-task-prev-column-button"));

        await waitFor(() => {
            expect(templateColumnService.moveTaskToColumn).toHaveBeenCalledWith(
                "template-1",
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

    test("resets edit state and calls onClose when header close is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-close"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    // Edit Mode

    test("switches to edit mode when pencil button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByText("Task Editing")).toBeTruthy();
    });

    test("pre-populates edit fields with current task values", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));

        expect(screen.getByDisplayValue("Fix bug")).toBeTruthy();
        expect(screen.getByDisplayValue("Fix the login bug")).toBeTruthy();
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

    test("calls updateTask and onChange when Save is pressed", async () => {
        templateColumnService.updateTask.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.changeText(screen.getByDisplayValue("Fix bug"), "Fix critical bug");
        fireEvent.press(screen.getByText("Save"));

        await waitFor(() => {
            expect(templateColumnService.updateTask).toHaveBeenCalledWith(
                "template-1",
                "col-2",
                "task-1",
                expect.objectContaining({ name: "Fix critical bug" })
            );
            expect(mockOnChange).toHaveBeenCalledWith("name", "Fix critical bug");
        });
    });

    test("exits edit mode after successful save", async () => {
        templateColumnService.updateTask.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-second-action"));
        fireEvent.press(screen.getByText("Save"));

        await waitFor(() => {
            expect(screen.getByText("Task Details")).toBeTruthy();
        });
    });

    // Hints Refetch

    test("calls onChange with hints when getTask returns updated task", async () => {
        templateColumnService.getTask.mockResolvedValueOnce({ hints: ["Hint 1"] });

        renderModal();

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith("hints", ["Hint 1"]);
        });
    });

    test("does not call onChange when getTask returns null", async () => {
        templateColumnService.getTask.mockResolvedValueOnce(null);

        renderModal();

        await waitFor(() => {
            expect(mockOnChange).not.toHaveBeenCalledWith("hints", expect.anything());
        });
    });
});