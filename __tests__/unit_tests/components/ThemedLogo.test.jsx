import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";

import * as ReactNative from "react-native";
import ThemedLogo from "../../../components/ThemedLogo";

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

describe("ThemedLogo", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
    });

    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        expect(UNSAFE_getByType(ReactNative.Image)).toBeTruthy();
    });

    test("applies correct logo styles", () => {
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        const image = UNSAFE_getByType(ReactNative.Image);

        expect(image.props.style).toMatchObject({
            width: 180,
            height: 180,
            marginBottom: 24,
        });
    });

    test("uses contain resize mode", () => {
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        const image = UNSAFE_getByType(ReactNative.Image);

        expect(image.props.resizeMode).toBe("contain");
    });

    test("uses light logo in light mode", () => {
        mockUseColorScheme.mockReturnValue("light");
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        const image = UNSAFE_getByType(ReactNative.Image);

        expect(image.props.source).toMatchObject({ testUri: "../../../assets/leico_light.png" });
    });

    test("uses dark logo in dark mode", () => {
        mockUseColorScheme.mockReturnValue("dark");
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        const image = UNSAFE_getByType(ReactNative.Image);

        expect(image.props.source).toMatchObject({ testUri: "../../../assets/leico_dark.png" });
    });

    test("uses dark logo when colorScheme is null", () => {
        mockUseColorScheme.mockReturnValue(null);
        const { UNSAFE_getByType } = render(<ThemedLogo />);
        const image = UNSAFE_getByType(ReactNative.Image);

        expect(image.props.source).toMatchObject({ testUri: "../../../assets/leico_dark.png" });
    });
});