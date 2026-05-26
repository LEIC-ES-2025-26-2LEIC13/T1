import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import CreateTemplateModal from "../../../components/CreateTemplateModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();

const mockProject = {
    title: "My Template",
    description: "Template description",
};

const renderModal = (overrides = {}) =>
    render(
        <CreateTemplateModal
            visible={true}
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            project={mockProject}
            onChange={mockOnChange}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();
});

describe("CreateTemplateModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("New Template")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter template title")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter template description (optional)")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("New Template")).toBeFalsy();
    });

    test("displays form field labels correctly", () => {
        renderModal();

        expect(screen.getByText("TEMPLATE TITLE")).toBeTruthy();
        expect(screen.getByText("DESCRIPTION")).toBeTruthy();
    });

    test("displays current project values", () => {
        renderModal();

        expect(screen.getByDisplayValue("My Template")).toBeTruthy();
        expect(screen.getByDisplayValue("Template description")).toBeTruthy();
    });

    test("calls onChange with 'title' when title field changes", () => {
        renderModal();

        fireEvent.changeText(screen.getByDisplayValue("My Template"), "Updated Template");

        expect(mockOnChange).toHaveBeenCalledWith("title", "Updated Template");
    });

    test("calls onChange with 'description' when description field changes", () => {
        renderModal();

        fireEvent.changeText(screen.getByDisplayValue("Template description"), "Updated description");

        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated description");
    });

    test("calls onCreate with project when Create button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).toHaveBeenCalledWith(mockProject);
    });

    test("Create button is disabled when title is empty", () => {
        renderModal({ project: { title: "", description: "" } });

        const createButton = screen.getByTestId("create-template-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("Create button is disabled when title is only whitespace", () => {
        renderModal({ project: { title: "   ", description: "" } });

        const createButton = screen.getByTestId("create-template-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("calls onClose when Cancel button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders modal actions correctly", () => {
        renderModal();

        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Create")).toBeTruthy();
    });

    test("handles project with minimal values", () => {
        renderModal({ project: { title: "Simple Template", description: "" } });

        expect(screen.getByDisplayValue("Simple Template")).toBeTruthy();
    });
});