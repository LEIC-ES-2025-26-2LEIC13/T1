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

// Mocks de UI otimizados com suporte correto a Default Exports
jest.mock("../../../components/ThemedIcon", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        __esModule: true,
        default: ({ name }) => <Text testID={`icon-${name}`}>{name}</Text>,
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

// Mock da navegação corrigido para passar as propriedades corretas do ícone
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
                {/* O React Navigation envia sempre um objeto com color, size e focused para o icon */}
                {icon && icon({ focused: false, color: "black", size: 24 })}
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