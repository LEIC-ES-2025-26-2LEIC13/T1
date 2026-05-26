import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import * as ReactNative from "react-native";

import AuthFooter from "../../../../components/auth/AuthFooter";

// Mocks

jest.mock("../../../../components/ThemedText", () => {
    const { Text } = require("react-native");
    return ({ children, testID, ...props }) => <Text testID={testID} {...props}>{children}</Text>;
});

jest.mock("../../../../components/ThemedButton", () => {
    const { View } = require("react-native");
    return ({ children, onPress, disabled, testID, style, ...props }) => (
        <View
            testID={testID ?? "themed-button"}
            onTouchEnd={onPress}
            disabled={disabled}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
});

jest.mock("../../../../components/Spacer", () => "Spacer");
jest.mock("../../../../components/Divider", () => "Divider");

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

// Tests

const defaultProps = {
    labelText: "Already have an account?",
    buttonText: "Sign In",
    onPress: jest.fn(),
    isLoading: false,
};

describe("AuthFooter", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
        jest.clearAllMocks();
        defaultProps.onPress = jest.fn();
    });

    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<AuthFooter {...defaultProps} />);
        expect(UNSAFE_getByType(ReactNative.View)).toBeTruthy();
    });

    test("renders label text", () => {
        const { getByText } = render(<AuthFooter {...defaultProps} />);
        expect(getByText("Already have an account?")).toBeTruthy();
    });

    test("renders button text", () => {
        const { getByText } = render(<AuthFooter {...defaultProps} />);
        expect(getByText("Sign In")).toBeTruthy();
    });

    test("calls onPress when button is pressed", () => {
        const { getByTestId } = render(<AuthFooter {...defaultProps} />);
        fireEvent(getByTestId("themed-button"), "touchEnd");
        expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });

    test("button is disabled when isLoading is true", () => {
        const { getByTestId } = render(<AuthFooter {...defaultProps} isLoading={true} />);
        expect(getByTestId("themed-button").props.disabled).toBe(true);
    });

    test("button is enabled when isLoading is false", () => {
        const { getByTestId } = render(<AuthFooter {...defaultProps} isLoading={false} />);
        expect(getByTestId("themed-button").props.disabled).toBe(false);
    });
});