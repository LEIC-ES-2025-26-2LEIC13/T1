import { describe, expect, test } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";
import { Keyboard, ScrollView } from "react-native";

import AuthBody from "../../../../components/auth/AuthBody";

describe("AuthBody", () => {
    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<AuthBody />);
        expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    test("renders children", () => {
        const { getByTestId } = render(
            <AuthBody>
                <React.Fragment>
                    <ScrollView testID="child" />
                </React.Fragment>
            </AuthBody>
        );
        expect(getByTestId("child")).toBeTruthy();
    });

    test("scroll is disabled", () => {
        const { UNSAFE_getByType } = render(<AuthBody />);
        expect(UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(false);
    });

    test("dismisses keyboard on touch", () => {
        const { UNSAFE_getByType } = render(<AuthBody />);
        expect(UNSAFE_getByType(ScrollView).props.onTouchStart).toBe(Keyboard.dismiss);
    });

    test("applies default content container styles", () => {
        const { UNSAFE_getByType } = render(<AuthBody />);
        expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "stretch",
                    paddingHorizontal: 30,
                }),
            ])
        );
    });

    test("merges custom style into content container", () => {
        const customStyle = { backgroundColor: "red" };
        const { UNSAFE_getByType } = render(<AuthBody style={customStyle} />);
        expect(UNSAFE_getByType(ScrollView).props.contentContainerStyle).toEqual(
            expect.arrayContaining([
                expect.objectContaining(customStyle),
            ])
        );
    });
});