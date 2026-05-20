import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import InviteProjectModal from "../../../components/InviteProjectModal";

const mockOnClose = jest.fn();
const mockOnInvite = jest.fn();
const mockOnChangeText = jest.fn();

// Mocks corrigidos e otimizados para Default Exports
jest.mock("../../../components/AppModal", () => {
    const React = require("react");
    const { View } = require("react-native");

    return {
        __esModule: true,
        default: ({ children, visible }) => (visible ? <View>{children}</View> : null),
    };
});

jest.mock("../../../components/modal/ModalHeader", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        __esModule: true,
        default: ({ heading }) => <Text>{heading}</Text>,
    };
});

jest.mock("../../../components/modal/ModalBody", () => {
    const React = require("react");
    const { View } = require("react-native");

    return {
        __esModule: true,
        default: ({ children }) => <View>{children}</View>,
    };
});

jest.mock("../../../components/Pill", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        __esModule: true,
        default: ({ projectName }) => <Text>{projectName}</Text>,
    };
});

jest.mock("../../../components/FormField", () => {
    const React = require("react");
    const { TextInput } = require("react-native");

    return {
        __esModule: true,
        default: ({ placeholder, value, onChangeText, testID }) => (
            <TextInput
                testID={testID}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
        ),
    };
});

jest.mock("../../../components/modal/ModalActions", () => {
    const React = require("react");
    const { View, Pressable, Text } = require("react-native");

    return {
        __esModule: true,
        default: ({
            onCancel,
            onPrimaryActionPress,
            primaryActionName,
            primaryActionDisabled,
        }) => (
            <View>
                <Pressable testID="cancel-button" onPress={onCancel}>
                    <Text>Cancel</Text>
                </Pressable>

                <Pressable
                    testID="invite-button"
                    onPress={onPrimaryActionPress}
                    accessibilityState={{
                        disabled: primaryActionDisabled,
                    }}
                >
                    <Text>{primaryActionName}</Text>
                </Pressable>
            </View>
        ),
    };
});

const renderModal = (overrides = {}) =>
    render(
        <InviteProjectModal
            visible={true}
            value=""
            onChangeText={mockOnChangeText}
            onClose={mockOnClose}
            onInvite={mockOnInvite}
            projectName="Project Alpha"
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnInvite.mockClear();
    mockOnChangeText.mockClear();
});

describe("InviteProjectModal", () => {
    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("Invite Member")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter user email")).toBeTruthy();
    });

    test("does not render when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Invite Member")).toBeFalsy();
    });

    test("renders project pill", () => {
        renderModal({
            projectName: "My Project",
        });

        expect(screen.getByText("My Project")).toBeTruthy();
    });

    test("renders email input value", () => {
        renderModal({
            value: "test@example.com",
        });

        expect(screen.getByDisplayValue("test@example.com")).toBeTruthy();
    });

    test("calls onChangeText when typing email", () => {
        renderModal();

        const input = screen.getByTestId("invite-email-input");
        fireEvent.changeText(input, "user@example.com");

        expect(mockOnChangeText).toHaveBeenCalledWith("user@example.com");
    });

    test("calls onInvite when Send Invite pressed", () => {
        renderModal({
            value: "user@example.com",
        });

        fireEvent.press(screen.getByTestId("invite-button"));

        expect(mockOnInvite).toHaveBeenCalled();
    });

    test("calls onClose when cancel pressed", () => {
        renderModal();

        fireEvent.press(screen.getByTestId("cancel-button"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("invite button disabled when email empty", () => {
        renderModal({
            value: "",
        });

        const button = screen.getByTestId("invite-button");

        expect(button.props.accessibilityState.disabled).toBe(true);
    });

    test("invite button disabled when email whitespace only", () => {
        renderModal({
            value: "   ",
        });

        const button = screen.getByTestId("invite-button");

        expect(button.props.accessibilityState.disabled).toBe(true);
    });

    test("invite button enabled when email valid", () => {
        renderModal({
            value: "valid@email.com",
        });

        const button = screen.getByTestId("invite-button");

        expect(button.props.accessibilityState.disabled).toBe(false);
    });

    test("renders Send Invite button", () => {
        renderModal();

        expect(screen.getByText("Send Invite")).toBeTruthy();
    });

    test("handles different project names", () => {
        renderModal({
            projectName: "Backend API",
        });

        expect(screen.getByText("Backend API")).toBeTruthy();
    });
});