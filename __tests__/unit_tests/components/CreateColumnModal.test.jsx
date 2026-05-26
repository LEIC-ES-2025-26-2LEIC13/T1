import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import CreateColumnModal from "../../../components/CreateColumnModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();

const mockColumnData = {
    name: "To Do",
};

const renderModal = (overrides = {}) =>
    render(
        <CreateColumnModal
            visible={true}
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            onChange={mockOnChange}
            columnData={mockColumnData}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();
});

describe("CreateColumnModal", () => {

    test("renders modal when visible", () => {
        renderModal();

        expect(screen.getByText("New Column")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter column name")).toBeTruthy();
        expect(screen.getByText("Create")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("New Column")).toBeFalsy();
    });

    test("displays form field for column name", () => {
        renderModal();

        expect(screen.getByText("COLUMN NAME")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter column name")).toBeTruthy();
    });

    test("displays current column name value", () => {
        renderModal();

        expect(screen.getByDisplayValue("To Do")).toBeTruthy();
    });

    test("updates column name on text change", () => {
        renderModal();

        const input = screen.getByDisplayValue("To Do");

        fireEvent.changeText(input, "In Progress");

        expect(mockOnChange).toHaveBeenCalledWith(
            "name",
            "In Progress"
        );
    });

    test("calls onCreate with columnData when Create button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).toHaveBeenCalledWith(mockColumnData);
    });

    test("does not call onCreate when column name is empty", () => {
        renderModal({
            columnData: { name: "" },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).not.toHaveBeenCalled();
    });


    test("does not call onCreate when column name is only whitespace", () => {
        renderModal({
            columnData: { name: "   " },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).not.toHaveBeenCalled();
    });


    test("calls onClose when Close/Cancel button is pressed", () => {
        renderModal();

        fireEvent.press(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test("handles column data with minimal values", () => {
        renderModal({
            columnData: {
                name: "",
            },
        });

        expect(screen.getByPlaceholderText("Enter column name")).toBeTruthy();
    });

    test("handles column data with populated values", () => {
        renderModal({
            columnData: {
                name: "Done",
            },
        });

        expect(screen.getByDisplayValue("Done")).toBeTruthy();
    });

    test("Create button works when column name is valid", () => {
        renderModal({
            columnData: {
                name: "Backlog",
            },
        });

        fireEvent.press(screen.getByText("Create"));

        expect(mockOnCreate).toHaveBeenCalledWith({
            name: "Backlog",
        });
    });

    test("renders modal header correctly", () => {
        renderModal();

        expect(screen.getByText("New Column")).toBeTruthy();
    });

    test("renders modal actions correctly", () => {
        renderModal();

        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Create")).toBeTruthy();
    });
});