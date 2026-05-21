import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import AssignMembersSection from "../../../components/AssignMembersSection";

jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({ user: { email: "me@example.com" } }),
}));

const mockOnAssignedMembersChange = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockMembers = [
    { id: "1", email: "me@example.com" },
    { id: "2", email: "other@example.com" },
];

const defaultProps = {
    assignedMembers: [],
    onAssignedMembersChange: mockOnAssignedMembersChange,
    getProjectUsers: mockGetProjectUsers,
    visible: true,
};

const renderComponent = (overrides = {}) =>
    render(<AssignMembersSection {...defaultProps} {...overrides} />);

beforeEach(() => {
    mockOnAssignedMembersChange.mockClear();
    mockGetProjectUsers.mockClear();
});

describe("AssignMembersSection", () => {

    test("renders Add Members button", () => {
        renderComponent();

        expect(screen.getByText("Add Members")).toBeTruthy();
    });

    test("renders assigned members list", () => {
        renderComponent({ assignedMembers: mockMembers });

        expect(screen.getByText("Me")).toBeTruthy();
        expect(screen.getByText("other@example.com")).toBeTruthy();
    });

    test("opens member selection modal when Add Members is pressed", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent();

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => {
            expect(screen.getByText("Assign Members")).toBeTruthy();
        });
    });

    test("shows project members in selection modal", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent();

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => {
            // getAllByText since the member may also appear in the assigned list
            expect(screen.getAllByText("other@example.com").length).toBeGreaterThan(0);
        });
    });

    test("shows error alert when getProjectUsers fails", async () => {
        mockGetProjectUsers.mockRejectedValueOnce(new Error("Network error"));
        renderComponent();

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => {
            expect(screen.getByText("Failed to Load Members")).toBeTruthy();
        });
    });

    test("calls onAssignedMembersChange adding a member when toggled on", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent();

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => screen.getAllByText("other@example.com"));
        // Press the instance inside the modal (last occurrence)
        const instances = screen.getAllByText("other@example.com");
        fireEvent.press(instances[instances.length - 1]);

        expect(mockOnAssignedMembersChange).toHaveBeenCalledWith([mockMembers[1]]);
    });

    test("calls onAssignedMembersChange removing a member when toggled off", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent({ assignedMembers: [mockMembers[1]] });

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => screen.getAllByText("other@example.com"));
        // member appears in both the assigned list and the modal — press modal instance
        const instances = screen.getAllByText("other@example.com");
        fireEvent.press(instances[instances.length - 1]);

        expect(mockOnAssignedMembersChange).toHaveBeenCalledWith([]);
    });

    test("clears assigned members when Go back is pressed in modal", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent({ assignedMembers: mockMembers });

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => screen.getByText("Assign Members"));
        fireEvent.press(screen.getByTestId("assign-members-modal-actions-cancel"));

        expect(mockOnAssignedMembersChange).toHaveBeenCalledWith([]);
    });

    test("closes modal when Done is pressed without clearing members", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        renderComponent({ assignedMembers: [mockMembers[1]] });

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => screen.getByText("Assign Members"));
        fireEvent.press(screen.getByTestId("assign-members-modal-actions-done"));

        await waitFor(() => {
            expect(screen.queryByText("Assign Members")).toBeFalsy();
        });
        expect(mockOnAssignedMembersChange).not.toHaveBeenCalled();
    });

    test("hides member selection modal when visible prop becomes false", async () => {
        mockGetProjectUsers.mockResolvedValueOnce(mockMembers);
        const { rerender } = renderComponent();

        fireEvent.press(screen.getByTestId("open-assign-members-button"));

        await waitFor(() => screen.getByText("Assign Members"));

        rerender(<AssignMembersSection {...defaultProps} visible={false} />);

        await waitFor(() => {
            expect(screen.queryByText("Assign Members")).toBeFalsy();
        });
    });
});