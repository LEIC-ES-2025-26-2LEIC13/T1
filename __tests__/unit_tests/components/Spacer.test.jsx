import { describe, expect, test } from '@jest/globals'
import React from "react";
import { render } from "@testing-library/react-native";
import Spacer from "../../../components/Spacer";

describe("Spacer", () => {
    test("renders without crashing", () => {
        const { UNSAFE_getByType } = render(<Spacer />);
        expect(UNSAFE_getByType("View")).toBeTruthy();
    });

    test("uses default width and height", () => {
        const { UNSAFE_getByType } = render(<Spacer />);
        const view = UNSAFE_getByType("View");

        expect(view.props.style).toMatchObject({
            width: "100%",
            height: 40,
        });
    });

    test("accepts custom width and height", () => {
        const { UNSAFE_getByType } = render(
            <Spacer width={200} height={10} />
        );

        const view = UNSAFE_getByType("View");

        expect(view.props.style).toMatchObject({
            width: 200,
            height: 10,
        });
    });
});