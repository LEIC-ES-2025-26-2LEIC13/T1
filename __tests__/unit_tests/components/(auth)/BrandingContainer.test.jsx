import { describe, expect, test, jest } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";
import { View } from "react-native";

import BrandingContainer from "../../../../components/auth/BrandingContainer";

// Mocks

jest.mock("../../../../components/ThemedLogo", () => "ThemedLogo");
jest.mock("../../../../components/ThemedText", () => {
    const { Text } = require("react-native");
    return ({ children, ...props }) => <Text {...props}>{children}</Text>;
});

// Tests

describe("BrandingContainer", () => {
    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<BrandingContainer />);
        expect(UNSAFE_getByType(View)).toBeTruthy();
    });

    test("renders the logo", () => {
        const { UNSAFE_getByType } = render(<BrandingContainer />);
        expect(UNSAFE_getByType("ThemedLogo")).toBeTruthy();
    });

    test("renders the slogan text", () => {
        const { getByText } = render(<BrandingContainer />);
        expect(getByText("From students to students")).toBeTruthy();
    });

    test("applies center alignment by default", () => {
        const { UNSAFE_getByType } = render(<BrandingContainer />);
        const view = UNSAFE_getByType(View);
        expect(view.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ alignItems: "center" }),
            ])
        );
    });

    test("merges custom style into container", () => {
        const customStyle = { marginTop: 50 };
        const { UNSAFE_getByType } = render(<BrandingContainer style={customStyle} />);
        const view = UNSAFE_getByType(View);
        expect(view.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining(customStyle),
            ])
        );
    });
});