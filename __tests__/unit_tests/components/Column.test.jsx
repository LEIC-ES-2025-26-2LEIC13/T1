import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import Columns from "../../../components/Columns";

// Mock Column component
jest.mock("../../../app/column", () => {
    // eslint-disable-next-line react/display-name
    return ({ columnData }) => {
        const React = require("react");
        const { Text } = require("react-native");

        return <Text>{columnData.name}</Text>;
    };
});

// Mock useWindowDimensions
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
    default: () => ({
        width: 400,
        height: 800,
        scale: 1,
        fontScale: 1,
    }),
}));

const mockOpenCreateColumnModal = jest.fn();

const mockColumns = [
    {
        id: "1",
        name: "To Do",
    },
    {
        id: "2",
        name: "In Progress",
    },
];

const renderColumns = (overrides = {}) =>
    render(
        <Columns
            columns={mockColumns}
            projectId="project-1"
            currentProjectName="Test Project"
            openCreateColumnModal={mockOpenCreateColumnModal}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOpenCreateColumnModal.mockClear();
});

describe("Columns", () => {

    test("renders all columns", () => {
        renderColumns();

        expect(screen.getByText("To Do")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("renders FlatList correctly", () => {
        renderColumns();

        expect(screen.getByText("To Do")).toBeTruthy();
    });

    test("does not show empty state when columns exist", () => {
        renderColumns();

        expect(
            screen.queryByText("No columns yet")
        ).toBeFalsy();
    });

    test("shows empty state when there are no columns", () => {
        renderColumns({
            columns: [],
        });

        expect(screen.getByText("No columns yet")).toBeTruthy();

        expect(
            screen.getByText(
                "Create the first column of the project using the button below"
            )
        ).toBeTruthy();
    });

    test("shows Create Column button when there are no columns", () => {
        renderColumns({
            columns: [],
        });

        expect(
            screen.getByText("Create Column")
        ).toBeTruthy();
    });

    test("does not show Create Column button when columns exist", () => {
        renderColumns();

        expect(
            screen.queryByText("Create Column")
        ).toBeFalsy();
    });

    test("calls openCreateColumnModal when Create Column button is pressed", () => {
        renderColumns({
            columns: [],
        });

        fireEvent.press(screen.getByText("Create Column"));

        expect(mockOpenCreateColumnModal).toHaveBeenCalled();
    });

    test("renders single column correctly", () => {
        renderColumns({
            columns: [
                {
                    id: "1",
                    name: "Done",
                },
            ],
        });

        expect(screen.getByText("Done")).toBeTruthy();
    });

    test("renders multiple columns correctly", () => {
        renderColumns();

        expect(screen.getByText("To Do")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("handles empty columns array", () => {
        renderColumns({
            columns: [],
        });

        expect(screen.getByText("No columns yet")).toBeTruthy();
    });

    test("passes correct props to Column component", () => {
        renderColumns({
            columns: [
                {
                    id: "1",
                    name: "Testing Column",
                },
            ],
        });

        expect(
            screen.getByText("Testing Column")
        ).toBeTruthy();
    });

    test("renders without crashing with minimal props", () => {
        render(
            <Columns
                columns={[]}
                projectId=""
                currentProjectName=""
                openCreateColumnModal={mockOpenCreateColumnModal}
            />
        );

        expect(screen.getByText("No columns yet")).toBeTruthy();
    });

});