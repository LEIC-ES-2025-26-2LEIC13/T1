import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import ThemedInvite from "../../../components/ThemedInvite";
import { Colors } from "../../../constants/Colors";


// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../components/ThemedText", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, testID, ...props }) => (
            <Text testID={testID} {...props}>{children}</Text>
        )
    };
});

jest.mock("../../../components/modal/ModalActions", () => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");
    return {
        __esModule: true,
        default: ({ onCancel, onPrimaryActionPress, primaryActionName, secondaryActionName }) => (
            <View>
                <TouchableOpacity testID="primary-action" onPress={onPrimaryActionPress}>
                    <Text>{primaryActionName}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="secondary-action" onPress={onCancel}>
                    <Text>{secondaryActionName}</Text>
                </TouchableOpacity>
            </View>
        )
    };
});


// ── Spies e Helpers ────────────────────────────────────────────────────────

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

const defaultProps = {
    projectName: "Test Project",
    sender: "John Doe",
    onAccept: jest.fn(),
    onIgnore: jest.fn(),
};


// ── Testes ─────────────────────────────────────────────────────────────────

describe("ThemedInvite", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
        jest.clearAllMocks();
    });

    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<ThemedInvite {...defaultProps} />);
        expect(UNSAFE_getByType(ReactNative.View)).toBeTruthy();
    });

    test("displays the project name", () => {
        const { getByTestId } = render(<ThemedInvite {...defaultProps} />);
        expect(getByTestId("project-title").props.children).toBe("Test Project");
    });

    test("applies light theme background color to card", () => {
        const { UNSAFE_getAllByType } = render(<ThemedInvite {...defaultProps} />);
        const views = UNSAFE_getAllByType(ReactNative.View);
        const card = views[0];

        expect(card.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.navBackground }),
            ])
        );
    });

    test("applies dark theme background color to card", () => {
        mockUseColorScheme.mockReturnValue("dark");
        const { UNSAFE_getAllByType } = render(<ThemedInvite {...defaultProps} />);
        const views = UNSAFE_getAllByType(ReactNative.View);
        const card = views[0];

        expect(card.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.dark.navBackground }),
            ])
        );
    });

    test("falls back to light theme when colorScheme is null", () => {
        mockUseColorScheme.mockReturnValue(null);
        const { UNSAFE_getAllByType } = render(<ThemedInvite {...defaultProps} />);
        const views = UNSAFE_getAllByType(ReactNative.View);
        const card = views[0];

        expect(card.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ backgroundColor: Colors.light.navBackground }),
            ])
        );
    });

    test("calls onAccept when primary action is pressed", () => {
        const { getByTestId } = render(<ThemedInvite {...defaultProps} />);
        fireEvent.press(getByTestId("primary-action"));
        expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
    });

    test("calls onIgnore when secondary action is pressed", () => {
        const { getByTestId } = render(<ThemedInvite {...defaultProps} />);
        fireEvent.press(getByTestId("secondary-action"));
        expect(defaultProps.onIgnore).toHaveBeenCalledTimes(1);
    });
});