import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import SuggestionModal from "../../../components/SuggestionModal";

const mockOnClose = jest.fn();
const mockDeleteSuggestion = jest.fn();

const mockSuggestion = {
    id: "s1",
    userEmail: "user@example.com",
    description: "Add dark mode support",
    projectName: "My Project",
    templateName: null,
};

const renderModal = (overrides = {}) =>
    render(
        <SuggestionModal
            visible={true}
            suggestion={mockSuggestion}
            onClose={mockOnClose}
            deleteSuggestion={mockDeleteSuggestion}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockDeleteSuggestion.mockClear();
});

describe("SuggestionModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Suggestion Details")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Suggestion Details")).toBeFalsy();
    });

    test("renders nothing when suggestion is null", () => {
        renderModal({ suggestion: null });

        expect(screen.queryByText("Suggestion Details")).toBeFalsy();
    });

    test("displays user email in SENT BY field", () => {
        renderModal();

        expect(screen.getByDisplayValue("user@example.com")).toBeTruthy();
    });

    test("displays fallback 'Unknown' when userEmail is missing", () => {
        renderModal({ suggestion: { ...mockSuggestion, userEmail: null } });

        expect(screen.getByDisplayValue("Unknown")).toBeTruthy();
    });

    test("displays suggestion description", () => {
        renderModal();

        expect(screen.getByDisplayValue("Add dark mode support")).toBeTruthy();
    });

    test("displays empty string when description is missing", () => {
        renderModal({ suggestion: { ...mockSuggestion, description: null } });

        expect(screen.getByDisplayValue("")).toBeTruthy();
    });

    test("displays projectName pill when present", () => {
        renderModal();

        expect(screen.getByText("My Project")).toBeTruthy();
    });

    test("does not display projectName pill when missing", () => {
        renderModal({ suggestion: { ...mockSuggestion, projectName: null } });

        expect(screen.queryByText("My Project")).toBeFalsy();
    });

    test("displays templateName pill when present", () => {
        renderModal({ suggestion: { ...mockSuggestion, templateName: "My Template" } });

        expect(screen.getByText("My Template")).toBeTruthy();
    });

    test("does not display templateName pill when missing", () => {
        renderModal();

        expect(screen.queryByText("My Template")).toBeFalsy();
    });

    test("calls deleteSuggestion and onClose when Delete is pressed", async () => {
        mockDeleteSuggestion.mockResolvedValueOnce();
        renderModal();

        fireEvent.press(screen.getByText("Delete"));

        await waitFor(() => {
            expect(mockDeleteSuggestion).toHaveBeenCalledWith("s1");
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test("does not call deleteSuggestion when it is not provided", async () => {
        renderModal({ deleteSuggestion: undefined });

        fireEvent.press(screen.getByText("Delete"));

        await waitFor(() => {
            expect(mockDeleteSuggestion).not.toHaveBeenCalled();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    test("calls onClose when Cancel is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders Delete and Cancel buttons", () => {
        renderModal();

        expect(screen.getByText("Delete")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
    });
});