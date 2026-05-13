import {
    jest,
    beforeEach,
    describe,
    test,
    expect,
} from "@jest/globals";

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import EditColumnModal from "../../../components/EditColumnModal";

const mockOnClose = jest.fn();
const mockOnEdit = jest.fn();

jest.mock("../../../components/AppModal", () => {
    return ({ children, visible }) => {
        const React = require("react");
        const { View } = require("react-native");

        return visible ? <View>{children}</View> : null;
    };
});

jest.mock("../../../components/modal/ModalHeader", () => {
    return ({ heading }) => {
        const React = require("react");
        const { Text } = require("react-native");

        return <Text>{heading}</Text>;
    };
});

jest.mock("../../../components/modal/ModalBody", () => {
    return ({ children }) => {
        const React = require("react");
        const { View } = require("react-native");

        return <View>{children}</View>;
    };
});

jest.mock("../../../components/FormField", () => {
    return ({ placeholder, value, onChangeText }) => {
        const React = require("react");
        const { TextInput } = require("react-native");

        return (
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
        );
    };
});

jest.mock("../../../components/modal/ModalActions", () => {
    return ({
                onCancel,
                onPrimaryActionPress,
                primaryActionName,
                primaryActionDisabled,
            }) => {
        const React = require("react");
        const { View, Text, Pressable } = require("react-native");

        return (
            <View>
                <Pressable
                    testID="cancel-button"
                    onPress={onCancel}
                >
                    <Text>Cancel</Text>
                </Pressable>

                <Pressable
                    testID="primary-button"
                    onPress={onPrimaryActionPress}
                    accessibilityState={{
                        disabled: primaryActionDisabled,
                    }}
                >
                    <Text>{primaryActionName}</Text>
                </Pressable>
            </View>
        );
    };
});

const mockColumnData = {
    id: "1",
    name: "To Do",
};

const renderModal = (overrides = {}) =>
    render(
        <EditColumnModal
            visible={true}
            onClose={mockOnClose}
            onEdit={mockOnEdit}
            columnData={mockColumnData}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnEdit.mockClear();
});

describe("EditColumnModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(
            screen.getByText("Edit Column Name")
        ).toBeTruthy();

        expect(
            screen.getByPlaceholderText("Enter new column title")
        ).toBeTruthy();
    });

    test("does not render when visible is false", () => {
        renderModal({ visible: false });

        expect(
            screen.queryByText("Edit Column Name")
        ).toBeFalsy();
    });

    test("renders edit button", () => {
        renderModal();

        expect(
            screen.getByText("Edit")
        ).toBeTruthy();
    });

    test("updates input value on text change", () => {
        renderModal();

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        fireEvent.changeText(input, "Updated Column");

        expect(input.props.value).toBe("Updated Column");
    });

    test("calls onEdit with updated column data", () => {
        renderModal();

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        fireEvent.changeText(input, "In Progress");

        fireEvent.press(
            screen.getByTestId("primary-button")
        );

        expect(mockOnEdit).toHaveBeenCalledWith({
            id: "1",
            name: "In Progress",
        });
    });

    test("calls onClose when cancel pressed", () => {
        renderModal();

        fireEvent.press(
            screen.getByTestId("cancel-button")
        );

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("edit button disabled when input empty", () => {
        renderModal();

        const button = screen.getByTestId("primary-button");

        expect(
            button.props.accessibilityState.disabled
        ).toBe(true);
    });

    test("edit button disabled when input whitespace only", () => {
        renderModal();

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        fireEvent.changeText(input, "   ");

        const button = screen.getByTestId("primary-button");

        expect(
            button.props.accessibilityState.disabled
        ).toBe(true);
    });

    test("edit button enabled when input valid", () => {
        renderModal();

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        fireEvent.changeText(input, "Done");

        const button = screen.getByTestId("primary-button");

        expect(
            button.props.accessibilityState.disabled
        ).toBe(false);
    });

    test("resets input when modal becomes visible", () => {
        const { rerender } = render(
            <EditColumnModal
                visible={false}
                onClose={mockOnClose}
                onEdit={mockOnEdit}
                columnData={mockColumnData}
            />
        );

        rerender(
            <EditColumnModal
                visible={true}
                onClose={mockOnClose}
                onEdit={mockOnEdit}
                columnData={mockColumnData}
            />
        );

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        expect(input.props.value).toBe("");
    });

    test("handles column data with different values", () => {
        renderModal({
            columnData: {
                id: "99",
                name: "Backlog",
            },
        });

        const input = screen.getByPlaceholderText(
            "Enter new column title"
        );

        fireEvent.changeText(input, "QA");

        fireEvent.press(
            screen.getByTestId("primary-button")
        );

        expect(mockOnEdit).toHaveBeenCalledWith({
            id: "99",
            name: "QA",
        });
    });

});