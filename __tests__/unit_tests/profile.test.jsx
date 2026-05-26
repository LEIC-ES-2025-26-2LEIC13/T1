import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react-native";

jest.mock("../../hooks/useAuth", () => ({
    useAuth: jest.fn(() => ({ user: { email: "john@example.com" } })),
}));

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../../components/SafeAreaPage", () => {
    const { View } = require("react-native");
    return ({ children }) => <View>{children}</View>;
});

import { useAuth } from "../../hooks/useAuth";
const useColorScheme = require("react-native/Libraries/Utilities/useColorScheme").default;
import Profile from "../../app/(home)/(drawer)/(tabs)/profile";

const renderProfile = () => render(<Profile />);

beforeEach(() => {
    useAuth.mockReturnValue({ user: { email: "john@example.com" } });
    useColorScheme.mockReturnValue("light");
});

describe("Profile", () => {

    test("renders the username derived from email", () => {
        renderProfile();

        expect(screen.getByText("john")).toBeTruthy();
    });

    test("renders the full email address", () => {
        renderProfile();

        expect(screen.getAllByText("john@example.com").length).toBeGreaterThan(0);
    });

    test("renders Account Information section title", () => {
        renderProfile();

        expect(screen.getByText("Account Information")).toBeTruthy();
    });

    test("renders Email Address label", () => {
        renderProfile();

        expect(screen.getByText("Email Address")).toBeTruthy();
    });

    test("renders fallback username when user is null", () => {
        useAuth.mockReturnValue({ user: null });
        renderProfile();

        expect(screen.getByText("User")).toBeTruthy();
    });

    test("falls back to light theme when color scheme is unknown", () => {
        useColorScheme.mockReturnValue("unknown");
        renderProfile();

        expect(screen.getByText("Account Information")).toBeTruthy();
    });
});