import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import SeeMembersModal from "../../../components/SeeMembersModal";

// Mocks

jest.mock("../../../components/AppModal", () => {
    const { View } = require("react-native");
    return ({ visible, children }) => visible ? <View testID="app-modal">{children}</View> : null;
});

jest.mock("../../../components/modal/ModalHeader", () => "ModalHeader");
jest.mock("../../../components/ThemedText", () => "ThemedText");
jest.mock("../../../components/ThemedIcon", () => "ThemedIcon");
jest.mock("../../../components/Spacer", () => "Spacer");
jest.mock("../../../components/OverflowMenu", () => {
    const { View } = require("react-native");
    return ({ testID }) => <View testID={testID} />;
});

jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({ user: { email: "me@example.com" } }),
}));

const mockUseColorScheme = jest.spyOn(ReactNative, "useColorScheme");

// Helpers

const members = [
    { id: "1", email: "me@example.com" },
    { id: "2", email: "other@example.com" },
];

const defaultProps = {
    visible: true,
    getProjectUsers: jest.fn().mockResolvedValue(members),
    onClose: jest.fn(),
    onKickMember: jest.fn().mockResolvedValue(),
};

// Tests

describe("SeeMembersModal", () => {
    beforeEach(() => {
        mockUseColorScheme.mockReturnValue("light");
        jest.clearAllMocks();
        defaultProps.getProjectUsers.mockResolvedValue(members);
        defaultProps.onKickMember.mockResolvedValue();
    });

    test("renders nothing when not visible", () => {
        const { queryByTestId } = render(
            <SeeMembersModal {...defaultProps} visible={false} />
        );
        expect(queryByTestId("app-modal")).toBeNull();
    });

    test("renders modal when visible", async () => {
        const { getByTestId } = render(<SeeMembersModal {...defaultProps} />);
        await waitFor(() => expect(getByTestId("app-modal")).toBeTruthy());
    });

    test("calls getProjectUsers on mount when visible", async () => {
        render(<SeeMembersModal {...defaultProps} />);
        await waitFor(() => expect(defaultProps.getProjectUsers).toHaveBeenCalledTimes(1));
    });

    test("does not call getProjectUsers when not visible", async () => {
        render(<SeeMembersModal {...defaultProps} visible={false} />);
        await waitFor(() => expect(defaultProps.getProjectUsers).not.toHaveBeenCalled());
    });

    test("renders an overflow menu per member", async () => {
        const { getByTestId } = render(<SeeMembersModal {...defaultProps} />);

        await waitFor(() => {
            expect(getByTestId("overflow-menu-me@example.com")).toBeTruthy();
            expect(getByTestId("overflow-menu-other@example.com")).toBeTruthy();
        });
    });

    test("places current user first in the list", async () => {
        const reversedMembers = [
            { id: "2", email: "other@example.com" },
            { id: "1", email: "me@example.com" },
        ];
        defaultProps.getProjectUsers.mockResolvedValue(reversedMembers);

        const { getAllByTestId } = render(<SeeMembersModal {...defaultProps} />);

        await waitFor(() => {
            const menus = getAllByTestId(/overflow-menu-/);
            expect(menus[0].props.testID).toBe("overflow-menu-me@example.com");
            expect(menus[1].props.testID).toBe("overflow-menu-other@example.com");
        });
    });

    test("handles getProjectUsers error gracefully", async () => {
        defaultProps.getProjectUsers.mockRejectedValue(new Error("fetch failed"));
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const { getByTestId } = render(<SeeMembersModal {...defaultProps} />);

        await waitFor(() => expect(getByTestId("app-modal")).toBeTruthy());
        expect(consoleSpy).toHaveBeenCalledWith("fetch failed");

        consoleSpy.mockRestore();
    });

    test("falls back to light theme when colorScheme is null", async () => {
        mockUseColorScheme.mockReturnValue(null);
        const { getByTestId } = render(<SeeMembersModal {...defaultProps} />);
        await waitFor(() => expect(getByTestId("app-modal")).toBeTruthy());
    });
});