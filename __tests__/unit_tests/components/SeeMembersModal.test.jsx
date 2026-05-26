import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import SeeMembersModal from "../../../components/SeeMembersModal";

jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({ user: { email: "me@example.com" } }),
}));

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    default: () => "light",
}));

jest.mock("../../../components/OverflowMenu", () => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return ({ testID, actions }) => (
        <View testID={testID}>
            {actions
                .filter((a) => !a.hidden)
                .map((a) => (
                    <TouchableOpacity key={a.id} testID={a.testID || a.id} onPress={a.onPress}>
                        <Text>{a.title}</Text>
                    </TouchableOpacity>
                ))}
        </View>
    );
});

const mockOnClose = jest.fn();
const mockOnKickMember = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockMembers = [
    { id: "u1", email: "alice@example.com" },
    { id: "u2", email: "me@example.com" },
    { id: "u3", email: "bob@example.com" },
];

const renderModal = (overrides = {}) =>
    render(
        <SeeMembersModal
            visible={true}
            getProjectUsers={mockGetProjectUsers}
            onClose={mockOnClose}
            onKickMember={mockOnKickMember}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnKickMember.mockClear();
    mockGetProjectUsers.mockClear();
    mockGetProjectUsers.mockResolvedValue(mockMembers);
});

describe("SeeMembersModal", () => {

    // Rendering

    test("renders modal when visible", async () => {
        renderModal();

        await waitFor(() => {
            expect(screen.getByText("Project Members")).toBeTruthy();
        });
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });

        expect(screen.queryByText("Project Members")).toBeFalsy();
    });

    test("renders member list after loading", async () => {
        renderModal();

        await waitFor(() => {
            expect(screen.getByText("alice@example.com")).toBeTruthy();
            expect(screen.getByText("bob@example.com")).toBeTruthy();
        });
    });

    test("displays current user as 'Me (email)'", async () => {
        renderModal();

        await waitFor(() => {
            expect(screen.getByText("Me (me@example.com)")).toBeTruthy();
        });
    });

    test("places current user first in the list", async () => {
        renderModal();

        await waitFor(() => {
            const allTexts = screen.getAllByText(/me@example\.com|alice@example\.com|bob@example\.com/);
            expect(allTexts[0].props.children).toContain("me@example.com");
        });
    });

    test("shows error alert when getProjectUsers fails", async () => {
        mockGetProjectUsers.mockRejectedValueOnce(new Error("Network error"));
        renderModal();

        await waitFor(() => {
            expect(screen.getByText("Failed to Load Members")).toBeTruthy();
        });
    });

    test("does not fetch members when visible is false", async () => {
        renderModal({ visible: false });

        expect(mockGetProjectUsers).not.toHaveBeenCalled();
    });

    // Overflow Menu

    test("shows 'Leave project' option for the current user", async () => {
        renderModal();

        await waitFor(() => {
            expect(screen.getByText("Leave project")).toBeTruthy();
        });
    });

    test("shows 'Kick member' option for other members", async () => {
        renderModal();

        await waitFor(() => {
            const kickButtons = screen.getAllByText("Kick member");
            expect(kickButtons.length).toBeGreaterThan(0);
        });
    });

    test("does not show 'Kick member' for the current user", async () => {
        mockGetProjectUsers.mockResolvedValueOnce([{ id: "u2", email: "me@example.com" }]);
        renderModal();

        await waitFor(() => screen.getByText("Me (me@example.com)"));

        expect(screen.queryByText("Kick member")).toBeFalsy();
    });

    test("does not show 'Leave project' for other members", async () => {
        mockGetProjectUsers.mockResolvedValueOnce([{ id: "u1", email: "alice@example.com" }]);
        renderModal();

        await waitFor(() => screen.getByText("alice@example.com"));

        expect(screen.queryByText("Leave project")).toBeFalsy();
    });

    // Actions

    test("calls onKickMember and refreshes list when Kick member is pressed", async () => {
        mockOnKickMember.mockResolvedValueOnce();
        renderModal();

        await waitFor(() => screen.getAllByText("Kick member"));
        fireEvent.press(screen.getAllByText("Kick member")[0]);

        await waitFor(() => {
            expect(mockOnKickMember).toHaveBeenCalled();
            expect(mockGetProjectUsers).toHaveBeenCalledTimes(2); // initial load + refresh
        });
    });

    test("calls onKickMember but does not refresh when current user leaves", async () => {
        mockOnKickMember.mockResolvedValueOnce();
        renderModal();

        await waitFor(() => screen.getByText("Leave project"));
        fireEvent.press(screen.getByText("Leave project"));

        await waitFor(() => {
            expect(mockOnKickMember).toHaveBeenCalled();
        });

        // getProjectUsers called only once (initial load), not again after self-leave
        expect(mockGetProjectUsers).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when header close button is pressed", async () => {
        renderModal();

        await waitFor(() => screen.getByText("Project Members"));
        fireEvent.press(screen.getByTestId("modal-header-close"));

        expect(mockOnClose).toHaveBeenCalled();
    });
});