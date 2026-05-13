import { jest, beforeEach, describe, test, expect } from "@jest/globals";

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import DrawerThemedButton from "../../../components/DrawerThemedButton";

const mockDispatch = jest.fn();

jest.mock("expo-router", () => ({
    useNavigation: () => ({
        dispatch: mockDispatch,
    }),
}));

jest.mock("@react-navigation/routers", () => ({
    DrawerActions: {
        toggleDrawer: jest.fn(() => ({
            type: "TOGGLE_DRAWER",
        })),
    },
}));

jest.mock("../../../components/ThemedIcon", () => {
    return ({ name, testID }) => {
        const React = require("react");
        const { Text } = require("react-native");

        return (
            <Text testID={testID || `icon-${name}`}>
                {name}
            </Text>
        );
    };
});

jest.mock("../../../components/AnimatedPressable", () => {
    return ({ children, onPress, testID }) => {
        const React = require("react");
        const { Pressable } = require("react-native");

        return (
            <Pressable
                onPress={onPress}
                testID={testID}
            >
                {children}
            </Pressable>
        );
    };
});

beforeEach(() => {
    mockDispatch.mockClear();
});

describe("DrawerThemedButton", () => {

    test("renders hamburger menu button", () => {
        render(<DrawerThemedButton showNotification={false} />);

        expect(
            screen.getByTestId("drawer-hamburger-button")
        ).toBeTruthy();

        expect(
            screen.getByText("menu")
        ).toBeTruthy();
    });

    test("dispatches toggle drawer action when pressed", () => {
        render(<DrawerThemedButton showNotification={false} />);

        fireEvent.press(
            screen.getByTestId("drawer-hamburger-button")
        );

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "TOGGLE_DRAWER",
        });
    });

    test("renders notification bell when showNotification is true", () => {
        render(<DrawerThemedButton showNotification />);

        expect(
            screen.getByTestId("notification-bell")
        ).toBeTruthy();

        expect(
            screen.getByText("bell")
        ).toBeTruthy();
    });

    test("does not render notification bell when showNotification is false", () => {
        render(<DrawerThemedButton showNotification={false} />);

        expect(
            screen.queryByTestId("notification-bell")
        ).toBeFalsy();
    });

    test("renders both menu and notification icons together", () => {
        render(<DrawerThemedButton showNotification />);

        expect(screen.getByText("menu")).toBeTruthy();
        expect(screen.getByText("bell")).toBeTruthy();
    });

});