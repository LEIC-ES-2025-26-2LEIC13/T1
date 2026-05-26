import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { suggestionService } from "../../../api/suggestionService";
import { addDoc, deleteDoc, getDocs, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn((ref) => ref),
    orderBy: jest.fn(),
    Timestamp: { now: jest.fn() },
    collection: jest.fn(),
    getDocs: jest.fn(),
}));

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {},
}));

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: { ADMIN: "admin" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        adminSuggestions: jest.fn((adminId) => `admin/${adminId}/suggestions`),
        adminSuggestion: jest.fn((adminId, suggestionId) => `admin/${adminId}/suggestions/${suggestionId}`),
    },
}));

describe("suggestionService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Timestamp.now.mockReturnValue("mocked-now");
    });

    describe("createSuggestion", () => {
        it("throws when user email is missing", async () => {
            await expect(
                suggestionService.createSuggestion("p1", "Project", "u1", "", { description: "hi" })
            ).rejects.toThrow("User email and suggestion description are required");
        });

        it("throws when suggestion description is missing", async () => {
            await expect(
                suggestionService.createSuggestion("p1", "Project", "u1", "u@test.com", {})
            ).rejects.toThrow("User email and suggestion description are required");
        });

        it("warns and returns early when there are no admins", async () => {
            const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
            getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

            await suggestionService.createSuggestion("p1", "Project", "u1", "u@test.com", {
                description: "Hello",
                templateName: "Temp",
            });

            expect(warnSpy).toHaveBeenCalled();
            expect(addDoc).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it("creates a suggestion for each admin with normalized fields", async () => {
            getDocs.mockResolvedValueOnce({
                empty: false,
                docs: [{ id: "a1" }, { id: "a2" }],
            });

            await suggestionService.createSuggestion("p1", "Project", "u1", "User@Email.com", {
                description: "  New idea  ",
                templateName: "  Template  ",
            });

            expect(addDoc).toHaveBeenCalledTimes(2);
            expect(addDoc).toHaveBeenCalledWith("admin/a1/suggestions", {
                description: "New idea",
                templateName: "Template",
                userEmail: "User@Email.com",
                createdAt: "mocked-now",
            });
        });
    });

    describe("subscribeToAllSuggestions", () => {
        it("calls onUpdate with mapped suggestions and returns unsubscribe", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({
                    docs: [
                        { id: "s1", data: () => ({ description: "A" }) },
                        { id: "s2", data: () => ({ description: "B" }) },
                    ],
                });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = suggestionService.subscribeToAllSuggestions("a1", onUpdate);

            expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
            expect(pathHelper.adminSuggestions).toHaveBeenCalledWith("a1");
            expect(onUpdate).toHaveBeenCalledWith([
                { id: "s1", description: "A" },
                { id: "s2", description: "B" },
            ]);
            expect(result).toBe(unsub);
        });
    });

    describe("deleteSuggestion", () => {
        it("throws when suggestionId is missing", async () => {
            await expect(suggestionService.deleteSuggestion("")).rejects.toThrow(
                "Suggestion ID is required to delete"
            );
        });

        it("deletes the suggestion from each admin", async () => {
            getDocs.mockResolvedValueOnce({
                empty: false,
                docs: [{ id: "a1" }, { id: "a2" }],
            });

            await suggestionService.deleteSuggestion("s1");

            expect(deleteDoc).toHaveBeenCalledTimes(2);
            expect(deleteDoc).toHaveBeenCalledWith("admin/a1/suggestions/s1");
            expect(deleteDoc).toHaveBeenCalledWith("admin/a2/suggestions/s1");
        });
    });
});
