import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import CreateProjectModal from "../../../components/CreateProjectModal";

jest.mock("react-native-gesture-handler", () => {
    const { FlatList } = require("react-native");
    return { FlatList };
});

const mockOnClose = jest.fn();
const mockOnCustomCreate = jest.fn();
const mockOnTemplateCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetTemplateProjects = jest.fn();

const mockProject = {
    title: "My Project",
    description: "Project description",
};

const mockTemplates = [
    { id: "t1", title: "ESOF Template", description: "Software Engineering template" },
    { id: "t2", title: "LDTS Template", description: "Design and Testing template" },
];

const renderModal = (overrides = {}) =>
    render(
        <CreateProjectModal
            visible={true}
            onClose={mockOnClose}
            onCustomCreate={mockOnCustomCreate}
            onTemplateCreate={mockOnTemplateCreate}
            project={mockProject}
            onChange={mockOnChange}
            getTemplateProjects={mockGetTemplateProjects}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCustomCreate.mockClear();
    mockOnTemplateCreate.mockClear();
    mockOnChange.mockClear();
    mockGetTemplateProjects.mockClear();
});

describe("CreateProjectModal", () => {

    // Choose Type

    test("renders choice step when modal opens", () => {
        renderModal();

        expect(screen.getByText("Create Project")).toBeTruthy();
        expect(screen.getByText("Template Project")).toBeTruthy();
        expect(screen.getByText("Custom Project")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Create Project")).toBeFalsy();
    });

    test("resets to step 1 when modal becomes visible again", () => {
        const { rerender } = renderModal({ visible: false });

        rerender(
            <CreateProjectModal
                visible={true}
                onClose={mockOnClose}
                onCustomCreate={mockOnCustomCreate}
                onTemplateCreate={mockOnTemplateCreate}
                project={mockProject}
                onChange={mockOnChange}
                getTemplateProjects={mockGetTemplateProjects}
            />
        );

        expect(screen.getByText("Create Project")).toBeTruthy();
    });

    test("calls onClose when close button is pressed on choice step", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("modal-header-close"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    // Template Project

    test("navigates to template step when Template Project is pressed", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => {
            expect(screen.getByText("Choose Template")).toBeTruthy();
        });
    });

    test("shows loading indicator while templates are loading", async () => {
        mockGetTemplateProjects.mockImplementationOnce(
            () => new Promise((resolve) => setTimeout(() => resolve(mockTemplates), 500))
        );
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => {
            expect(screen.getByText("Loading templates...")).toBeTruthy();
        });
    });

    test("renders template list after loading", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => {
            expect(screen.getByText("ESOF Template")).toBeTruthy();
            expect(screen.getByText("LDTS Template")).toBeTruthy();
        });
    });

    test("shows empty state when no templates are available", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce([]);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => {
            expect(screen.getByText("No template projects available")).toBeTruthy();
        });
    });

    test("shows error alert when getTemplateProjects fails", async () => {
        mockGetTemplateProjects.mockRejectedValueOnce(new Error("Network error"));
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => {
            expect(screen.getByText("Failed to Load Templates")).toBeTruthy();
        });
    });

    test("goes back to choice step when Cancel is pressed on template step", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => screen.getByText("Choose Template"));
        fireEvent.press(screen.getByTestId("template-project-modal-actions-cancel"));

        expect(screen.getByText("Create Project")).toBeTruthy();
    });

    test("clears selection and onChange when going back from template step", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => screen.getByText("Choose Template"));
        fireEvent.press(screen.getByTestId("template-project-modal-actions-cancel"));

        expect(mockOnChange).toHaveBeenCalledWith("title", "");
        expect(mockOnChange).toHaveBeenCalledWith("description", "");
    });

    test("selects a template and calls onChange with its data", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => screen.getByText("ESOF Template"));
        fireEvent.press(screen.getByText("ESOF Template"));

        expect(mockOnChange).toHaveBeenCalledWith("title", "ESOF Template");
        expect(mockOnChange).toHaveBeenCalledWith("description", "Software Engineering template");
    });

    test("deselects template when pressed again", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => screen.getByText("ESOF Template"));
        fireEvent.press(screen.getByText("ESOF Template"));
        fireEvent.press(screen.getByText("ESOF Template"));

        expect(mockOnChange).toHaveBeenCalledWith("title", "");
        expect(mockOnChange).toHaveBeenCalledWith("description", "");
    });

    test("calls onTemplateCreate with selected template when Create is pressed", async () => {
        mockGetTemplateProjects.mockResolvedValueOnce(mockTemplates);
        mockOnTemplateCreate.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("choice-template-project"));

        await waitFor(() => screen.getByText("ESOF Template"));
        fireEvent.press(screen.getByText("ESOF Template"));
        fireEvent.press(screen.getByTestId("template-project-modal-actions-create"));

        await waitFor(() => {
            expect(mockOnTemplateCreate).toHaveBeenCalledWith(mockTemplates[0]);
        });
    });

    // Custom Project

    test("navigates to custom project step when Custom Project is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));

        expect(screen.getByText("New Project")).toBeTruthy();
    });

    test("displays form fields in custom project step", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));

        expect(screen.getByText("PROJECT TITLE")).toBeTruthy();
        expect(screen.getByText("DESCRIPTION")).toBeTruthy();
    });

    test("displays current project values in custom project step", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));

        expect(screen.getByDisplayValue("My Project")).toBeTruthy();
        expect(screen.getByDisplayValue("Project description")).toBeTruthy();
    });

    test("calls onChange with 'title' when title field changes", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));
        fireEvent.changeText(screen.getByDisplayValue("My Project"), "Updated Project");

        expect(mockOnChange).toHaveBeenCalledWith("title", "Updated Project");
    });

    test("calls onChange with 'description' when description field changes", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));
        fireEvent.changeText(screen.getByDisplayValue("Project description"), "Updated description");

        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated description");
    });

    test("calls onCustomCreate with project when Create is pressed", async () => {
        mockOnCustomCreate.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));
        fireEvent.press(screen.getByText("Create"));

        await waitFor(() => {
            expect(mockOnCustomCreate).toHaveBeenCalledWith(mockProject);
        });
    });

    test("goes back to choice step when Cancel is pressed on custom step", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("choice-custom-project"));
        fireEvent.press(screen.getByTestId("create-project-modal-actions-cancel"));

        expect(screen.getByText("Create Project")).toBeTruthy();
    });

    test("Create button is disabled when title is empty on custom step", () => {
        renderModal({ project: { title: "", description: "" } });

        fireEvent.press(screen.getByTestId("choice-custom-project"));

        const createButton = screen.getByTestId("create-project-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("Create button is disabled when title is only whitespace on custom step", () => {
        renderModal({ project: { title: "   ", description: "" } });

        fireEvent.press(screen.getByTestId("choice-custom-project"));

        const createButton = screen.getByTestId("create-project-modal-actions-create");
        expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });
});