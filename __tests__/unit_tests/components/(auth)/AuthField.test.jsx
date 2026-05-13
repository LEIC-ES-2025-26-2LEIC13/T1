import { describe, expect, test, jest } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";
import { View } from "react-native";
import AuthField from "../../../../components/auth/AuthField";

// Mocks

jest.mock("../../../../components/ThemedText", () => {
    const { Text } = require("react-native");
    return ({ children, testID, ...props }) => <Text testID={testID} {...props}>{children}</Text>;
});

jest.mock("../../../../components/ThemedTextInput", () => {
    const { TextInput } = require("react-native");
    return (props) => <TextInput {...props} />;
});

// Tests

const defaultProps = {
    labelName: "Email",
    placeholder: "Enter your email",
    testID: "auth-field-input",
    value: "",
    onChangeText: jest.fn(),
};

describe("AuthField", () => {
    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<AuthField {...defaultProps} />);
        expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    test("renders the label text", () => {
        const { getByText } = render(<AuthField {...defaultProps} />);
        expect(getByText("Email")).toBeTruthy();
    });

    test("renders the input with correct testID", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} />);
        expect(getByTestId("auth-field-input")).toBeTruthy();
    });

    test("passes placeholder to input", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} />);
        expect(getByTestId("auth-field-input").props.placeholder).toBe("Enter your email");
    });

    test("passes value to input", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} value="test@email.com" />);
        expect(getByTestId("auth-field-input").props.value).toBe("test@email.com");
    });

    test("passes onChangeText to input", () => {
        const onChangeText = jest.fn();
        const { getByTestId } = render(<AuthField {...defaultProps} onChangeText={onChangeText} />);
        expect(getByTestId("auth-field-input").props.onChangeText).toBe(onChangeText);
    });

    test("passes secureTextEntry to input", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} secureTextEntry={true} />);
        expect(getByTestId("auth-field-input").props.secureTextEntry).toBe(true);
    });

    test("passes keyboardType to input", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} keyboardType="email-address" />);
        expect(getByTestId("auth-field-input").props.keyboardType).toBe("email-address");
    });

    test("passes autoCapitalize to input", () => {
        const { getByTestId } = render(<AuthField {...defaultProps} autoCapitalize="none" />);
        expect(getByTestId("auth-field-input").props.autoCapitalize).toBe("none");
    });
});