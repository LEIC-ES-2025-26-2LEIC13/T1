import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import ThemedSuggestion from "../../../components/ThemedSuggestion";

jest.mock("../../../components/SuggestionModal", () => {
    const { View, Text } = require("react-native");
    return ({ visible, onClose }) =>
        visible ? (
            <View>
                <Text>Suggestion Modal</Text>
                <Text testID="modal-close" onPress={onClose}>Close</Text>
            </View>
        ) : null;
});

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    default: () => "light",
}));

const mockOnPress = jest.fn();

const mockSuggestion = {
    description: "Add dark mode support",
    userEmail: "user@example.com",
};

const renderComponent = (overrides = {}) =>
    render(
        <ThemedSuggestion
            suggestion={mockSuggestion}
            onPress={mockOnPress}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnPress.mockClear();
});

describe("ThemedSuggestion", () => {

    test("renders suggestion description", () => {
        renderComponent();

        expect(screen.getByText("Add dark mode support")).toBeTruthy();
    });

    test("renders suggestion user email", () => {
        renderComponent();

        expect(screen.getByText("user@example.com")).toBeTruthy();
    });

    test("renders fallback text when description is missing", () => {
        renderComponent({ suggestion: { userEmail: "user@example.com" } });

        expect(screen.getByText("Suggestion")).toBeTruthy();
    });

    test("renders fallback text when userEmail is missing", () => {
        renderComponent({ suggestion: { description: "Some suggestion" } });

        expect(screen.getByText("Unknown")).toBeTruthy();
    });

    test("renders fallback text when suggestion is null", () => {
        renderComponent({ suggestion: null });

        expect(screen.getByText("Suggestion")).toBeTruthy();
        expect(screen.getByText("Unknown")).toBeTruthy();
    });

    test("does not show modal initially", () => {
        renderComponent();

        expect(screen.queryByText("Suggestion Modal")).toBeFalsy();
    });

    test("opens modal when card is pressed", () => {
        renderComponent();

        fireEvent.press(screen.getByText("Add dark mode support"));

        expect(screen.getByText("Suggestion Modal")).toBeTruthy();
    });

    test("calls onPress when card is pressed", () => {
        renderComponent();

        fireEvent.press(screen.getByText("Add dark mode support"));

        expect(mockOnPress).toHaveBeenCalled();
    });

    test("closes modal when onClose is triggered", () => {
        renderComponent();

        fireEvent.press(screen.getByText("Add dark mode support"));
        fireEvent.press(screen.getByTestId("modal-close"));

        expect(screen.queryByText("Suggestion Modal")).toBeFalsy();
    });

    test("does not crash when onPress prop is not provided", () => {
        renderComponent({ onPress: undefined });

        expect(() => fireEvent.press(screen.getByText("Add dark mode support"))).not.toThrow();
    });
});