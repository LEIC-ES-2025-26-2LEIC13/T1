import { jest, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react-native";

import LoadingScreen from "../../../components/LoadingScreen";

// Mocks
jest.mock("../../../components/ThemedView", () => {
    const React = require("react");
    const { View } = require("react-native");

    return {
        __esModule: true,
        default: ({ children }) => <View>{children}</View>,
    };
});

jest.mock("../../../components/ThemedText", () => {
    const React = require("react");
    const { Text } = require("react-native");

    return {
        __esModule: true,
        default: ({ children }) => <Text>{children}</Text>,
    };
});

describe("LoadingScreen", () => {

    test("renders loading text", () => {
        render(
            <LoadingScreen
                loadingText="Loading projects..."
            />
        );

        expect(
            screen.getByText("Loading projects...")
        ).toBeTruthy();
    });

    test("renders ActivityIndicator", () => {
        render(
            <LoadingScreen
                loadingText="Loading..."
            />
        );

        const indicator = screen.UNSAFE_getByType(
            require("react-native").ActivityIndicator
        );

        expect(indicator).toBeTruthy();
    });

    test("renders different loading messages", () => {
        render(
            <LoadingScreen
                loadingText="Please wait"
            />
        );

        expect(
            screen.getByText("Please wait")
        ).toBeTruthy();
    });

    test("renders empty loading text safely", () => {
        render(
            <LoadingScreen
                loadingText=""
            />
        );

        expect(
            screen.getByText("")
        ).toBeTruthy();
    });

    test("renders overlay container", () => {
        const { UNSAFE_getAllByType } = render(
            <LoadingScreen
                loadingText="Loading"
            />
        );

        const views = UNSAFE_getAllByType(
            require("react-native").View
        );

        expect(views.length).toBeGreaterThan(0);
    });

});