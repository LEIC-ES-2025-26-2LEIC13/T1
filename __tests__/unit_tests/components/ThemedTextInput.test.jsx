import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import ThemedTextInput from "../../../components/ThemedTextInput";
import { Colors } from "../../../constants/Colors";

// Mocks

jest.mock("../../../components/ThemedIcon", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        __esModule: true,
        default: ({ name, testID, ...props }) => (
            <View testID={testID ?? `icon-${name}`} {...props} />
        )
    };
});

jest.mock("../../../components/AnimatedPressable", () => {
    const React = require("react");
    const { TouchableOpacity } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, onPress, testID }) => (
            <TouchableOpacity testID={testID ?? "animated-pressable"} onPress={onPress}>
                {children}
            </TouchableOpacity>
        )
    };
});

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

// Tests

describe("ThemedTextInput", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
    });

    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput />);
        expect(UNSAFE_getByType(ReactNative.View)).toBeTruthy();
    });

    test("renders the text input", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput testID="input" />);
        expect(UNSAFE_getByType(ReactNative.TextInput)).toBeTruthy();
    });

    test("passes testID to text input", () => {
        const { getByTestId } = render(<ThemedTextInput testID="my-input" />);
        expect(getByTestId("my-input")).toBeTruthy();
    });

    test("passes placeholder to text input", () => {
        const { getByPlaceholderText } = render(<ThemedTextInput placeholder="Enter text" />);
        expect(getByPlaceholderText("Enter text")).toBeTruthy();
    });

    test("passes readOnly to text input", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput readOnly={true} />);
        expect(UNSAFE_getByType(ReactNative.TextInput).props.readOnly).toBe(true);
    });

    test("passes multiline to text input", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput multiline={true} />);
        expect(UNSAFE_getByType(ReactNative.TextInput).props.multiline).toBe(true);
    });

    test("scroll is disabled on text input", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput />);
        expect(UNSAFE_getByType(ReactNative.TextInput).props.scrollEnabled).toBe(false);
    });

    test("applies light theme colors to container", () => {
        const { UNSAFE_getAllByType } = render(<ThemedTextInput />);
        const container = UNSAFE_getAllByType(ReactNative.View)[0];
        expect(container.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    borderColor: Colors.light.borders,
                    backgroundColor: Colors.light.background,
                }),
            ])
        );
    });

    test("applies dark theme colors to container", () => {
        mockUseColorScheme.mockReturnValue("dark");
        const { UNSAFE_getAllByType } = render(<ThemedTextInput />);
        const container = UNSAFE_getAllByType(ReactNative.View)[0];
        expect(container.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    borderColor: Colors.dark.borders,
                    backgroundColor: Colors.dark.background,
                }),
            ])
        );
    });

    test("falls back to light theme when colorScheme is null", () => {
        mockUseColorScheme.mockReturnValue(null);
        const { UNSAFE_getAllByType } = render(<ThemedTextInput />);
        const container = UNSAFE_getAllByType(ReactNative.View)[0];
        expect(container.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    borderColor: Colors.light.borders,
                    backgroundColor: Colors.light.background,
                }),
            ])
        );
    });

    test("applies light theme colors to text input", () => {
        const { UNSAFE_getByType } = render(<ThemedTextInput />);
        const input = UNSAFE_getByType(ReactNative.TextInput);
        expect(input.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    backgroundColor: Colors.light.background,
                    color: Colors.light.text,
                }),
            ])
        );
    });

    test("renders left icon when leftIcon prop is provided", () => {
        const { getByTestId } = render(<ThemedTextInput leftIcon="magnify" />);
        expect(getByTestId("icon-magnify")).toBeTruthy();
    });

    test("does not render left icon when leftIcon prop is absent", () => {
        const { queryByTestId } = render(<ThemedTextInput />);
        expect(queryByTestId(/^icon-/)).toBeNull();
    });

    test("renders right icon when rightIcon prop is provided", () => {
        const { getByTestId } = render(<ThemedTextInput rightIcon="eye" />);
        expect(getByTestId("icon-eye")).toBeTruthy();
    });

    test("wraps right icon in AnimatedPressable when onRightIconPress is provided", () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <ThemedTextInput rightIcon="eye" onRightIconPress={onPress} />
        );
        expect(getByTestId("animated-pressable")).toBeTruthy();
    });

    test("calls onRightIconPress when pressable is pressed", () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <ThemedTextInput rightIcon="eye" onRightIconPress={onPress} />
        );
        fireEvent.press(getByTestId("animated-pressable"));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test("does not wrap right icon in AnimatedPressable without onRightIconPress", () => {
        const { queryByTestId } = render(<ThemedTextInput rightIcon="eye" />);
        expect(queryByTestId("animated-pressable")).toBeNull();
    });

    test("merges custom container style", () => {
        const customStyle = { marginBottom: 30 };
        const { UNSAFE_getAllByType } = render(<ThemedTextInput containerStyle={customStyle} />);
        const container = UNSAFE_getAllByType(ReactNative.View)[0];
        expect(container.props.style).toEqual(
            expect.arrayContaining([customStyle])
        );
    });

    test("merges custom input style", () => {
        const customStyle = { fontSize: 20 };
        const { UNSAFE_getByType } = render(<ThemedTextInput style={customStyle} />);
        const input = UNSAFE_getByType(ReactNative.TextInput);
        expect(input.props.style).toEqual(
            expect.arrayContaining([customStyle])
        );
    });
});