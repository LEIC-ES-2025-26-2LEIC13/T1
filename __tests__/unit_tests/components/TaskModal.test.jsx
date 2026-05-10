import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TaskModal from "../../../components/TaskModal";

const mockDeleteTask = jest.fn();
const mockOnClose = jest.fn();

const mockTask = {
    id: "task-1",
    name: "Complete project",
    description: "Finish the React Native project",
    label: "urgent",
    assignedMembers: [
        { email: "user1@example.com" },
        { email: "user2@example.com" },
    ],
};

const renderModal = (overrides = {}) =>
    render(
        <TaskModal
            visible={true}
            task={mockTask}
            projectName="Project A"
            columnName="To Do"
            onClose={mockOnClose}
            deleteTask={mockDeleteTask}
            {...overrides}
        />,
    );

beforeEach(() => {
    mockDeleteTask.mockClear();
    mockOnClose.mockClear();
});

describe("TaskModal", () => {
    test("renders modal with task details when visible", () => {
        renderModal();
        expect(screen.getByText("Task Details")).toBeTruthy();
        expect(screen.getByDisplayValue("Complete project")).toBeTruthy();
        expect(
            screen.getByDisplayValue("Finish the React Native project"),
        ).toBeTruthy();
    });

    test("does not render when visible is false", () => {
        renderModal({ visible: false });
        expect(screen.queryByText("Task Details")).toBeFalsy();
    });

    test("displays assigned members emails joined by comma", () => {
        renderModal();
        expect(
            screen.getByDisplayValue("user1@example.com, user2@example.com"),
        ).toBeTruthy();
    });

    test('displays "No one" when assignedMembers is empty or null', () => {
        const { rerender } = renderModal({
            task: { ...mockTask, assignedMembers: [] },
        });
        expect(screen.getByDisplayValue("No one")).toBeTruthy();

        rerender(
            <TaskModal
                visible={true}
                task={{ ...mockTask, assignedMembers: null }}
                projectName="Project A"
                columnName="To Do"
                onClose={mockOnClose}
                deleteTask={mockDeleteTask}
            />,
        );
        expect(screen.getByDisplayValue("No one")).toBeTruthy();
    });

    test("displays project, column and label pills", () => {
        renderModal({ projectName: "My Project", columnName: "In Progress" });
        expect(screen.getByText("My Project")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
        expect(screen.getByText("urgent")).toBeTruthy();
    });

    test("hides label pill when label is empty or null", () => {
        const { rerender } = renderModal({ task: { ...mockTask, label: "" } });
        expect(screen.queryByText("urgent")).toBeFalsy();

        rerender(
            <TaskModal
                visible={true}
                task={{ ...mockTask, label: null }}
                projectName="Project A"
                columnName="To Do"
                onClose={mockOnClose}
                deleteTask={mockDeleteTask}
            />,
        );
        expect(screen.queryByText("urgent")).toBeFalsy();
    });

    test('pressing "Finish Task" calls deleteTask', () => {
        renderModal();
        fireEvent.press(screen.getByText("Finish Task"));
        expect(mockDeleteTask).toHaveBeenCalledWith("task-1");
    });

    test("description is multiline with placeholder when empty", () => {
        const { UNSAFE_getAllByType } = renderModal({
            task: { ...mockTask, description: "" },
        });
        const inputs = UNSAFE_getAllByType("TextInput");
        const descriptionInput = inputs.find(
            (i) => i.props.placeholder === "No description provided.",
        );
        expect(descriptionInput?.props.multiline).toBe(true);
    });
});
