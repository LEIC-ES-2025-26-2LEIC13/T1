import {
    jest,
    beforeEach,
    describe,
    test,
    expect,
} from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import CustomDrawerContent from "../../../components/CustomDrawerContent";

const mockLogout = jest.fn();

jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({
        logout: mockLogout,
    }),
}));

// ICON MOCK (so we can test it properly)
jest.mock("../../../components/ThemedIcon", () => {
    return ({ name }) => {
        const React = require("react");
        const { Text } = require("react-native");
        return <Text testID={`icon-${name}`}>{name}</Text>;
    };
});

// simple UI mocks
jest.mock("../../../components/Divider", () => {
    return () => {
        const React = require("react");
        const { View } = require("react-native");
        return <View testID="divider" />;
    };
});

jest.mock("../../../components/Spacer", () => {
    return () => {
        const React = require("react");
        const { View } = require("react-native");
        return <View testID="spacer" />;
    };
});

// minimal navigation mock
jest.mock("@react-navigation/drawer", () => {
    const React = require("react");
    const { View, Text, Pressable } = require("react-native");

    return {
        DrawerContentScrollView: ({ children }) => (
            <View>{children}</View>
        ),

        DrawerItemList: () => (
            <Text>DrawerItemList</Text>
        ),

        DrawerItem: ({ label, onPress, icon }) => (
            <Pressable onPress={onPress} testID={`drawer-${label}`}>
                <Text>{label}</Text>
                {icon && icon()}
            </Pressable>
        ),
    };
});

beforeEach(() => {
    mockLogout.mockClear();
});

describe("CustomDrawerContent", () => {

    test("renders drawer structure", () => {
        render(<CustomDrawerContent />);

        expect(screen.getByText("DrawerItemList")).toBeTruthy();
        expect(screen.getByText("Logout")).toBeTruthy();
    });

    test("renders logout icon", () => {
        render(<CustomDrawerContent />);

        expect(screen.getByTestId("icon-logout")).toBeTruthy();
    });

    test("renders layout elements", () => {
        render(<CustomDrawerContent />);

        expect(screen.getAllByTestId("spacer").length).toBe(2);
        expect(screen.getByTestId("divider")).toBeTruthy();
    });

    test("calls logout when pressed", () => {
        render(<CustomDrawerContent />);

        fireEvent.press(screen.getByTestId("drawer-Logout"));

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test("logout button exists", () => {
        render(<CustomDrawerContent />);

        expect(screen.getByText("Logout")).toBeTruthy();
    });

});