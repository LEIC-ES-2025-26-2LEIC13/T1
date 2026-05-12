import { jest, describe, expect, test } from '@jest/globals'
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ThemedTask from "../../../components/ThemedTask";

jest.mock("../../../components/ThemedView", () => require("react-native").View);
jest.mock("../../../components/ThemedText", () => require("react-native").Text);
jest.mock("../../../components/Pill", () => {
    const { Text } = require("react-native");
    return ({ name }) => <Text>{name}</Text>;
});
jest.mock("../../../components/AnimatedPressable", () => {
    const { Pressable } = require("react-native");
    return ({ children, onPress }) => (
        <Pressable onPress={onPress}>{children}</Pressable>
    );
});

// safe constants
jest.mock("../../../constants/Labels", () => ({
    LABELS: [],
}));

jest.mock("../../../constants/Colors", () => ({
    Colors: {
        light: { borders: "#000" },
    },
    LabelColors: {
        default: "#ccc",
        urgent: "#ff0000",
    },
}));

describe("ThemedTask", () => {
    const task = {
        name: "My Task",
        description: "Do something",
        label: "urgent",
    };

    test("renders task name", () => {
        const { getByText } = render(
            <ThemedTask task={task} onPress={jest.fn()} />
        );

        expect(getByText("My Task")).toBeTruthy();
    });

    test("renders description", () => {
        const { getByText } = render(
            <ThemedTask task={task} onPress={jest.fn()} />
        );

        expect(getByText("Do something")).toBeTruthy();
    });

    test("calls onPress when pressed", () => {
        const mock = jest.fn();

        const { getByText } = render(
            <ThemedTask task={task} onPress={mock} />
        );

        fireEvent.press(getByText("My Task"));
        expect(mock).toHaveBeenCalled();
    });

    test("renders without description safely", () => {
        const { getByText } = render(
            <ThemedTask task={{ name: "No desc" }} onPress={jest.fn()} />
        );

        expect(getByText("No desc")).toBeTruthy();
    });
});