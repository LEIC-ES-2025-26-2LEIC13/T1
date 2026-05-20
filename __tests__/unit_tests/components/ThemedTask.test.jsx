import { jest, describe, expect, test } from '@jest/globals'
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ThemedTask from "../../../components/ThemedTask";

// Mocks uniformizados com __esModule e require otimizado
jest.mock("../../../components/ThemedView", () => {
    const React = require("react");
    const { View } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, ...props }) => <View {...props}>{children}</View>
    };
});

jest.mock("../../../components/ThemedText", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, ...props }) => <Text {...props}>{children}</Text>
    };
});

jest.mock("../../../components/Pill", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return {
        __esModule: true,
        default: ({ name }) => <Text>{name}</Text>
    };
});

jest.mock("../../../components/AnimatedPressable", () => {
    const React = require("react");
    const { Pressable } = require("react-native");
    return {
        __esModule: true,
        default: ({ children, onPress }) => (
            <Pressable onPress={onPress}>{children}</Pressable>
        )
    };
});

// Constantes seguras
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