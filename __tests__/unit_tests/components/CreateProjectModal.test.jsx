import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CreateProjectModal from "../../../components/CreateProjectModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();

const mockProject = {
    title: "My Project",
    description: "Project description",
};

const renderModal = (overrides = {}) =>
    render(
        <CreateProjectModal
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

describe("CreateProjectModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("New Project")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter project title")).toBeTruthy();
        expect(
            screen.getByPlaceholderText(
                "Enter project description (optional)"
            )
        ).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("New Project")).toBeFalsy();
    });

    test("displays form fields correctly", () => {
        renderModal();

        expect(screen.getByText("PROJECT TITLE")).toBeTruthy();
        expect(screen.getByText("DESCRIPTION")).toBeTruthy();
    });

    test("displays current project values", () => {
        renderModal();

        expect(screen.getByDisplayValue("My Project")).toBeTruthy();
        expect(screen.getByDisplayValue("Project description")).toBeTruthy();
    });

    test("updates project title on text change", () => {
        renderModal();

        const titleInput = screen.getByDisplayValue("My Project");

        fireEvent.changeText(titleInput, "Updated Project");

        expect(mockOnChange).toHaveBeenCalledWith(
            "title",
            "Updated Project"
        );
    });

    test("updates project description on text change", () => {
        renderModal();

        const descriptionInput =
            screen.getByDisplayValue("Project description");

        fireEvent.changeText(
            descriptionInput,
            "Updated description"
        );

        expect(mockOnChange).toHaveBeenCalledWith(
            "description",
            "Updated description"
        );
    });

    test("calls onCreate with project when Create button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).toHaveBeenCalledWith(mockProject);
    });

    test("does not call onCreate when project title is empty", () => {
        renderModal({
            project: {
                title: "",
                description: "",
            },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("does not call onCreate when project title is only whitespace", () => {
        renderModal({
            project: {
                title: "   ",
                description: "",
            },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("calls onClose when Cancel button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("handles project with minimal values", () => {
        renderModal({
            project: {
                title: "Simple Project",
                description: "",
            },
        });

        expect(screen.getByDisplayValue("Simple Project")).toBeTruthy();
    });

    test("handles fully populated project", () => {
        renderModal({
            project: {
                title: "Full Project",
                description: "Complete description",
            },
        });

        expect(screen.getByDisplayValue("Full Project")).toBeTruthy();
        expect(
            screen.getByDisplayValue("Complete description")
        ).toBeTruthy();
    });

    test("Create button works when project title is valid", () => {
        renderModal({
            project: {
                title: "Valid Project",
                description: "",
            },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).toHaveBeenCalledWith({
            title: "Valid Project",
            description: "",
        });
    });

    test("renders modal header correctly", () => {
        renderModal();

        expect(screen.getByText("New Project")).toBeTruthy();
    });

    test("renders modal actions correctly", () => {
        renderModal();

        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Create")).toBeTruthy();
    });
});