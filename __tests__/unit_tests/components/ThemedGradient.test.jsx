import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";
import * as ReactNative from "react-native";

import ThemedGradient from "../../../components/ThemedGradient";
import { Colors } from "../../../constants/Colors";

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
    LinearGradient: "LinearGradient",
}));

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

describe("ThemedGradient", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
    });

    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<ThemedGradient />);
        expect(UNSAFE_getByType("LinearGradient")).toBeTruthy();
    });

    test("applies absoluteFill style", () => {
        const { UNSAFE_getByType } = render(<ThemedGradient />);
        const gradient = UNSAFE_getByType("LinearGradient");

        expect(gradient.props.style).toMatchObject({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
        });
    });

    test("uses correct gradient direction in light mode", () => {
        const { UNSAFE_getByType } = render(<ThemedGradient />);
        const gradient = UNSAFE_getByType("LinearGradient");

        expect(gradient.props.start).toEqual({ x: 0.2, y: 0 });
        expect(gradient.props.end).toEqual({ x: 0.8, y: 1 });
    });

    test("uses correct gradient direction in dark mode", () => {
        mockUseColorScheme.mockReturnValue("dark");
        const { UNSAFE_getByType } = render(<ThemedGradient />);
        const gradient = UNSAFE_getByType("LinearGradient");

        expect(gradient.props.start).toEqual({ x: 0.2, y: 0 });
        expect(gradient.props.end).toEqual({ x: 0.8, y: 1 });
    });

    test("falls back to light theme when colorScheme is null", () => {
        mockUseColorScheme.mockReturnValue(null);
        const theme = Colors.light;
        const { UNSAFE_getByType } = render(<ThemedGradient />);
        const gradient = UNSAFE_getByType("LinearGradient");

        expect(gradient.props.colors).toEqual([
            theme.navBackground,
            Colors.primary,
        ]);
    });
});