import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import CreateSuggestionModal from "../../../components/CreateSuggestionModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();

const mockSuggestion = {
    description: "Add dark mode support",
};

const renderModal = (overrides = {}) =>
    render(
        <CreateSuggestionModal
            visible={true}
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            onChange={mockOnChange}
            suggestion={mockSuggestion}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();
});

describe("CreateSuggestionModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Make a suggestion")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter suggestion description")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Make a suggestion")).toBeFalsy();
    });

    test("displays form field label correctly", () => {
        renderModal();

        expect(screen.getByText("SUGGESTION DESCRIPTION")).toBeTruthy();
    });

    test("displays current suggestion description", () => {
        renderModal();

        expect(screen.getByDisplayValue("Add dark mode support")).toBeTruthy();
    });

    test("calls onChange with 'description' when field changes", () => {
        renderModal();

        fireEvent.changeText(
            screen.getByDisplayValue("Add dark mode support"),
            "Add light mode support"
        );

        expect(mockOnChange).toHaveBeenCalledWith("description", "Add light mode support");
    });

    test("calls onCreate with suggestion when Submit is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Submit"));

        expect(mockOnCreate).toHaveBeenCalledWith(mockSuggestion);
    });

    test("Submit button is disabled when description is empty", () => {
        renderModal({ suggestion: { description: "" } });

        const submitButton = screen.getByTestId("undefined-submit");
        expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("Submit button is disabled when description is only whitespace", () => {
        renderModal({ suggestion: { description: "   " } });

        const submitButton = screen.getByTestId("undefined-submit");
        expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    test("calls onClose when Cancel is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders Submit and Cancel buttons", () => {
        renderModal();

        expect(screen.getByText("Submit")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
    });
});