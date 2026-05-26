import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
    },
}));

jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
    GoogleAuthProvider: {
        credential: jest.fn(() => "mock-credential"),
    },
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    setDoc: jest.fn(),
    getDoc: jest.fn(),
}));

jest.mock("../../../firebase/firebaseConfig.js", () => ({
    auth: {},
}));

jest.mock("../../../api/pathHelper.js", () => ({
    pathHelper: {
        user: jest.fn((uid) => `users/${uid}`),
        admin: jest.fn((uid) => `admins/${uid}`),
    },
}));

import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from "firebase/auth";
import { setDoc, getDoc } from "firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { authService } from "../../../api/authService.js";

const mockUser = { uid: "user-1", email: "user@example.com" };

beforeEach(() => {
    jest.clearAllMocks();
});

describe("authService", () => {

    // subscribeAuthState

    describe("subscribeAuthState", () => {
        it("calls onUpdate with current user when auth state changes", () => {
            const mockOnUpdate = jest.fn();
            onAuthStateChanged.mockImplementation((auth, cb) => {
                cb(mockUser);
                return jest.fn();
            });

            authService.subscribeAuthState(mockOnUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
        });

        it("returns the unsubscribe function", () => {
            const unsubscribe = jest.fn();
            onAuthStateChanged.mockReturnValueOnce(unsubscribe);

            const result = authService.subscribeAuthState(jest.fn());

            expect(result).toBe(unsubscribe);
        });
    });

    // signInWithGoogle

    describe("signInWithGoogle", () => {
        it("signs in with Google and calls onUpdate with the user", async () => {
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ data: { idToken: "mock-id-token" } });
            signInWithCredential.mockResolvedValueOnce({ user: mockUser });
            getDoc.mockResolvedValueOnce({ exists: () => false });
            setDoc.mockResolvedValueOnce();

            const mockOnUpdate = jest.fn();
            const result = await authService.signInWithGoogle(mockOnUpdate);

            expect(GoogleAuthProvider.credential).toHaveBeenCalledWith("mock-id-token");
            expect(signInWithCredential).toHaveBeenCalled();
            expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
            expect(result).toBe(mockUser);
        });

        it("creates user document when user is not an admin", async () => {
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ data: { idToken: "mock-id-token" } });
            signInWithCredential.mockResolvedValueOnce({ user: mockUser });
            getDoc.mockResolvedValueOnce({ exists: () => false }); // not admin

            await authService.signInWithGoogle(jest.fn());

            expect(setDoc).toHaveBeenCalledWith(
                `users/${mockUser.uid}`,
                { email: mockUser.email },
                { merge: true }
            );
        });

        it("does not create user document when user is an admin", async () => {
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ data: { idToken: "mock-id-token" } });
            signInWithCredential.mockResolvedValueOnce({ user: mockUser });
            getDoc.mockResolvedValueOnce({ exists: () => true }); // is admin

            await authService.signInWithGoogle(jest.fn());

            expect(setDoc).not.toHaveBeenCalled();
        });

        it("throws when idToken is missing from Google Sign-In response", async () => {
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ data: {} }); // no idToken

            await expect(authService.signInWithGoogle(jest.fn())).rejects.toThrow(
                "Failed to obtain ID token from Google Sign-In."
            );
        });

        it("handles legacy response format without data wrapper", async () => {
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ idToken: "legacy-token" }); // legacy format
            signInWithCredential.mockResolvedValueOnce({ user: mockUser });
            getDoc.mockResolvedValueOnce({ exists: () => false });

            const mockOnUpdate = jest.fn();
            await authService.signInWithGoogle(mockOnUpdate);

            expect(GoogleAuthProvider.credential).toHaveBeenCalledWith("legacy-token");
            expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
        });

        it("normalizes email to lowercase before storing", async () => {
            const userWithUpperEmail = { uid: "user-1", email: "USER@EXAMPLE.COM" };
            GoogleSignin.hasPlayServices.mockResolvedValueOnce();
            GoogleSignin.signIn.mockResolvedValueOnce({ data: { idToken: "mock-id-token" } });
            signInWithCredential.mockResolvedValueOnce({ user: userWithUpperEmail });
            getDoc.mockResolvedValueOnce({ exists: () => false });

            await authService.signInWithGoogle(jest.fn());

            expect(setDoc).toHaveBeenCalledWith(
                expect.anything(),
                { email: "user@example.com" },
                { merge: true }
            );
        });
    });

    // signOut

    describe("signOut", () => {
        it("signs out from Google and Firebase", async () => {
            GoogleSignin.signOut.mockResolvedValueOnce();
            firebaseSignOut.mockResolvedValueOnce();

            await authService.signOut();

            expect(GoogleSignin.signOut).toHaveBeenCalled();
            expect(firebaseSignOut).toHaveBeenCalled();
        });

        it("still signs out from Firebase even if Google sign-out fails", async () => {
            GoogleSignin.signOut.mockRejectedValueOnce(new Error("Google sign-out failed"));
            firebaseSignOut.mockResolvedValueOnce();

            await authService.signOut();

            expect(firebaseSignOut).toHaveBeenCalled();
        });
    });

    // isAdmin

    describe("isAdmin", () => {
        it("returns true when admin document exists", async () => {
            getDoc.mockResolvedValueOnce({ exists: () => true });

            const result = await authService.isAdmin(mockUser);

            expect(result).toBe(true);
        });

        it("returns false when admin document does not exist", async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });

            const result = await authService.isAdmin(mockUser);

            expect(result).toBe(false);
        });
    });
});