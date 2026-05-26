import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import TemplateCreateTaskModal from "../../../components/TemplateCreateTaskModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockTask = {
    name: "Fix bug",
    description: "Fix the login bug",
};

const renderModal = (overrides = {}) =>
    render(
        <TemplateCreateTaskModal
            visible={true}
            projectName="My Project"
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
    mockGetProjectUsers.mockClear();
});

describe("TemplateCreateTaskModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Create Task")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Create Task")).toBeFalsy();
    });

    test("displays project name and column name as pills", () => {
        renderModal();

        expect(screen.getByText("My Project")).toBeTruthy();
        expect(screen.getByText("To Do")).toBeTruthy();
    });

    test("displays form field labels correctly", () => {
        renderModal();

        expect(screen.getByText("TASK NAME")).toBeTruthy();
        expect(screen.getByText("DESCRIPTION")).toBeTruthy();
    });

    test("displays current task values", () => {
        renderModal();

        expect(screen.getByDisplayValue("Fix bug")).toBeTruthy();
        expect(screen.getByDisplayValue("Fix the login bug")).toBeTruthy();
    });

    test("calls onChange with 'name' when task name field changes", () => {
        renderModal();

        fireEvent.changeText(screen.getByDisplayValue("Fix bug"), "New bug fix");

        expect(mockOnChange).toHaveBeenCalledWith("name", "New bug fix");
    });

    test("calls onChange with 'description' when description field changes", () => {
        renderModal();

        fireEvent.changeText(screen.getByDisplayValue("Fix the login bug"), "Updated description");

        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated description");
    });

    test("calls onCreate with task when Create button is pressed", async () => {
        mockOnCreate.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByText("Create"));

        await waitFor(() => {
            expect(mockOnCreate).toHaveBeenCalledWith(mockTask);
        });
    });

    test("Create button is disabled when task name is empty", () => {
        renderModal({ task: { name: "", description: "" } });

        const createButton = screen.getByTestId("create-task-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("Create button is disabled when task name is only whitespace", () => {
        renderModal({ task: { name: "   ", description: "" } });

        const createButton = screen.getByTestId("create-task-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("calls onClose when Cancel button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("create-task-modal-actions-cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders modal actions correctly", () => {
        renderModal();

        expect(screen.getByText("Create")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    });

    test("handles task with minimal values", () => {
        renderModal({ task: { name: "Simple Task", description: "" } });

        expect(screen.getByDisplayValue("Simple Task")).toBeTruthy();
    });
});