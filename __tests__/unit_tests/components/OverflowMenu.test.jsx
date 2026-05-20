import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import OverflowMenu from "../../../components/OverflowMenu";

const mockOnPress = jest.fn();

jest.mock("react-native-popup-menu", () => {
    const React = require("react");
    const { View, Pressable } = require("react-native");

    return {
        Menu: ({ children }) => <View>{children}</View>,

        MenuTrigger: ({ children, testID }) => (
            <Pressable testID={testID}>
                {children}
            </Pressable>
        ),

        MenuOptions: ({ children }) => (
            <View>{children}</View>
        ),

        MenuOption: ({ children, onSelect }) => (
            <Pressable onPress={onSelect}>
                {children}
            </Pressable>
        ),
    };
});

// Mocks otimizados com suporte para default exports
jest.mock("../../../components/ThemedIcon", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        __esModule: true,
        default: ({ name }) => <Text>{name}</Text>,
    };
});

jest.mock("../../../components/ThemedText", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        __esModule: true,
        default: ({ children }) => <Text>{children}</Text>,
    };
});

jest.mock("../../../components/Divider", () => {
    const React = require("react");
    const { View } = require("react-native");

    return {
        __esModule: true,
        default: () => <View testID="divider" />,
    };
});

jest.mock("../../../components/Spacer", () => {
    const React = require("react");
    const { View } = require("react-native");

    return {
        __esModule: true,
        default: () => <View testID="spacer" />,
    };
});

jest.mock("../../../components/AnimatedPressable", () => {
    const React = require("react");
    const { Pressable } = require("react-native");

    return {
        __esModule: true,
        default: ({ children, onPress, testID }) => (
            <Pressable onPress={onPress} testID={testID}>
                {children}
            </Pressable>
        ),
    };
});

jest.mock("../../../components/ThemedAlert", () => {
    const React = require("react");
    const { View, Text, Pressable } = require("react-native");

    const ALERT_TYPES = {
        INFO: "info",
    };

    const MockAlert = ({ visible, alert, onConfirm, onCancel }) => {
        if (!visible) return null;

        return (
            <View>
                <Text>{alert.title}</Text>
                <Text>{alert.message}</Text>

                <Pressable
                    testID="confirm-alert"
                    onPress={onConfirm}
                >
                    <Text>Confirm</Text>
                </Pressable>

                <Pressable
                    testID="cancel-alert"
                    onPress={onCancel}
                >
                    <Text>Cancel</Text>
                </Pressable>
            </View>
        );
    };

    MockAlert.ALERT_TYPES = ALERT_TYPES;

    return {
        __esModule: true,
        default: MockAlert,
        ALERT_TYPES,
    };
});

const actions = [
    {
        id: "edit",
        title: "Edit",
        icon: "pencil",
        onPress: mockOnPress,
    },
    {
        id: "delete",
        title: "Delete",
        icon: "trash-can",
        destructive: true,
        onPress: mockOnPress,
        confirm: {
            title: "Delete Project",
            message: "Are you sure?",
        },
    },
];

const renderMenu = (overrides = {}) =>
    render(
        <OverflowMenu
            testID="overflow-menu"
            actions={actions}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnPress.mockClear();
});

describe("OverflowMenu", () => {

    test("renders menu trigger", () => {
        renderMenu();

        expect(
            screen.getByTestId("overflow-menu")
        ).toBeTruthy();
    });

    test("renders menu icon", () => {
        renderMenu();

        expect(
            screen.getByText("dots-vertical")
        ).toBeTruthy();
    });

    test("renders all visible actions", () => {
        renderMenu();

        expect(
            screen.getByText("Edit")
        ).toBeTruthy();

        expect(
            screen.getByText("Delete")
        ).toBeTruthy();
    });

    test("renders action icons", () => {
        renderMenu();

        expect(
            screen.getByText("pencil")
        ).toBeTruthy();

        expect(
            screen.getByText("trash-can")
        ).toBeTruthy();
    });

    test("calls onPress directly for non-confirm actions", () => {
        renderMenu();

        fireEvent.press(
            screen.getByText("Edit")
        );

        expect(mockOnPress).toHaveBeenCalled();
    });

    test("shows alert for confirm actions", () => {
        renderMenu();

        fireEvent.press(
            screen.getByText("Delete")
        );

        expect(
            screen.getByText("Delete Project")
        ).toBeTruthy();

        expect(
            screen.getByText("Are you sure?")
        ).toBeTruthy();
    });

    test("confirms alert action", () => {
        renderMenu();

        fireEvent.press(
            screen.getByText("Delete")
        );

        fireEvent.press(
            screen.getByTestId("confirm-alert")
        );

        expect(mockOnPress).toHaveBeenCalled();
    });

    test("cancels alert without calling action", () => {
        renderMenu();

        fireEvent.press(
            screen.getByText("Delete")
        );

        fireEvent.press(
            screen.getByTestId("cancel-alert")
        );

        expect(mockOnPress).not.toHaveBeenCalled();
    });

    test("filters hidden actions", () => {
        renderMenu({
            actions: [
                {
                    id: "visible",
                    title: "Visible Action",
                    onPress: mockOnPress,
                },
                {
                    id: "hidden",
                    title: "Hidden Action",
                    hidden: true,
                    onPress: mockOnPress,
                },
            ],
        });

        expect(
            screen.getByText("Visible Action")
        ).toBeTruthy();

        expect(
            screen.queryByText("Hidden Action")
        ).toBeFalsy();
    });

    test("renders divider between actions", () => {
        renderMenu();

        expect(
            screen.getAllByTestId("divider").length
        ).toBeGreaterThan(0);
    });

    test("renders spacers between actions", () => {
        renderMenu();

        expect(
            screen.getAllByTestId("spacer").length
        ).toBeGreaterThan(0);
    });

    test("handles empty actions array", () => {
        renderMenu({
            actions: [],
        });

        expect(
            screen.getByTestId("overflow-menu")
        ).toBeTruthy();
    });

    test("handles actions without icons", () => {
        renderMenu({
            actions: [
                {
                    id: "simple",
                    title: "Simple Action",
                    onPress: mockOnPress,
                },
            ],
        });

        expect(
            screen.getByText("Simple Action")
        ).toBeTruthy();
    });

    test("handles customColor prop", () => {
        renderMenu({
            customColor: "red",
        });

        expect(
            screen.getByTestId("overflow-menu")
        ).toBeTruthy();
    });

});