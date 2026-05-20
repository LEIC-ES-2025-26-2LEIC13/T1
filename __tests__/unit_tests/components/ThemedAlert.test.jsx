import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ThemedAlert, { ALERT_TYPES } from "../../../components/ThemedAlert";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../components/AppModal", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        __esModule: true,
        default: ({ visible, children, onClose }) =>
            visible ? <View testID="app-modal" onTouchEnd={onClose}>{children}</View> : null
    };
});

jest.mock("../../../components/ThemedIcon", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        __esModule: true,
        default: ({ name, testID }) => <View testID={testID ?? `icon-${name}`} />
    };
});

jest.mock("../../../components/ThemedText", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, ...props }) => <Text {...props}>{children}</Text>
    };
});

jest.mock("../../../components/ThemedButton", () => {
    const React = require("react");
    const { TouchableOpacity } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, onPress, testID, ...props }) => (
            <TouchableOpacity testID={testID ?? "themed-button"} onPress={onPress} {...props}>
                {children}
            </TouchableOpacity>
        )
    };
});

jest.mock("../../../components/Spacer", () => ({
    __esModule: true,
    default: () => null // Devolver null é mais seguro no React Native que uma String solta
}));


// ── Helpers ────────────────────────────────────────────────────────────────

const defaultAlert = {
    type: ALERT_TYPES.INFO,
    title: "Test Title",
    message: "Test message",
};

const defaultProps = {
    visible: true,
    alert: defaultAlert,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
};


// ── Tests ──────────────────────────────────────────────────────────────────

describe("ALERT_TYPES", () => {
    test("exports the correct icon names", () => {
        expect(ALERT_TYPES).toEqual({
            ERROR: "alert-circle",
            WARNING: "alert",
            INFO: "information",
            SUCCESS: "check-circle",
        });
    });
});

describe("ThemedAlert", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        defaultProps.onConfirm = jest.fn();
        defaultProps.onCancel = jest.fn();
    });

    test("renders nothing when not visible", () => {
        const { queryByTestId } = render(
            <ThemedAlert {...defaultProps} visible={false} />
        );
        expect(queryByTestId("app-modal")).toBeNull();
    });

    test("renders modal when visible", () => {
        const { getByTestId } = render(<ThemedAlert {...defaultProps} />);
        expect(getByTestId("app-modal")).toBeTruthy();
    });

    test("renders alert title", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        expect(getByText("Test Title")).toBeTruthy();
    });

    test("renders alert message", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        expect(getByText("Test message")).toBeTruthy();
    });

    test("renders correct icon for valid alert type", () => {
        const { getByTestId } = render(<ThemedAlert {...defaultProps} />);
        expect(getByTestId(`icon-${ALERT_TYPES.INFO}`)).toBeTruthy();
    });

    test("falls back to ERROR icon for invalid alert type", () => {
        const { getByTestId } = render(
            <ThemedAlert {...defaultProps} alert={{ ...defaultAlert, type: "invalid-type" }} />
        );
        expect(getByTestId(`icon-${ALERT_TYPES.ERROR}`)).toBeTruthy();
    });

    test("renders correct icon for each valid alert type", () => {
        Object.values(ALERT_TYPES).forEach((type) => {
            const { getByTestId, unmount } = render(
                <ThemedAlert {...defaultProps} alert={{ ...defaultAlert, type }} />
            );
            expect(getByTestId(`icon-${type}`)).toBeTruthy();
            unmount();
        });
    });

    test("renders OK button", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        expect(getByText("OK")).toBeTruthy();
    });

    test("calls onConfirm when OK is pressed", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        fireEvent.press(getByText("OK"));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    test("renders Cancel button when onCancel is provided", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        expect(getByText("Cancel")).toBeTruthy();
    });

    test("calls onCancel when Cancel is pressed", () => {
        const { getByText } = render(<ThemedAlert {...defaultProps} />);
        fireEvent.press(getByText("Cancel"));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    test("does not render Cancel button when onCancel is not provided", () => {
        const { queryByText } = render(
            <ThemedAlert {...defaultProps} onCancel={undefined} />
        );
        expect(queryByText("Cancel")).toBeNull();
    });

    test("calls onCancel when modal is closed and onCancel is provided", () => {
        const { getByTestId } = render(<ThemedAlert {...defaultProps} />);
        fireEvent(getByTestId("app-modal"), "touchEnd");
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    test("calls onConfirm when modal is closed and onCancel is not provided", () => {
        const { getByTestId } = render(
            <ThemedAlert {...defaultProps} onCancel={undefined} />
        );
        fireEvent(getByTestId("app-modal"), "touchEnd");
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
});