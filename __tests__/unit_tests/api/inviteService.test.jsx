import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { inviteService } from "../../../api/inviteService";
import { addDoc, deleteDoc, getDocs, getDoc, onSnapshot, Timestamp, where, runTransaction } from "firebase/firestore";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("firebase/firestore", () => ({
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn((ref) => ref),
    Timestamp: { now: jest.fn() },
    where: jest.fn(),
    runTransaction: jest.fn(),
}));

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        userInvites: jest.fn((userId) => `users/${userId}/invites`),
        userInvite: jest.fn((userId, inviteId) => `users/${userId}/invites/${inviteId}`),
        projectUser: jest.fn((projectId, userId) => `projects/${projectId}/users/${userId}`),
        project: jest.fn((projectId) => `projects/${projectId}`),
        userProject: jest.fn((userId, projectId) => `users/${userId}/projects/${projectId}`),
        userProjects: jest.fn((userId) => `users/${userId}/projects`),
    },
}));

describe("inviteService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Timestamp.now.mockReturnValue("mocked-now");
    });

    describe("subscribeToUserInvites", () => {
        it("maps invites and returns unsubscribe", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({
                    docs: [
                        { id: "i1", data: () => ({ projectId: "p1" }) },
                        { id: "i2", data: () => ({ projectId: "p2" }) },
                    ],
                });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = inviteService.subscribeToUserInvites("u1", onUpdate);

            expect(pathHelper.userInvites).toHaveBeenCalledWith("u1");
            expect(onUpdate).toHaveBeenCalledWith([
                { id: "i1", projectId: "p1" },
                { id: "i2", projectId: "p2" },
            ]);
            expect(result).toBe(unsub);
        });
    });

    describe("sendInvite", () => {
        it("throws when an invite already exists for the project", async () => {
            getDocs.mockResolvedValueOnce({ empty: false });

            await expect(inviteService.sendInvite({
                senderId: "u1",
                senderEmail: "u1@test.com",
                receiverId: "u2",
                projectId: "p1",
                projectName: "Project",
            })).rejects.toThrow("Invite already sent to this user for this project");

            expect(addDoc).not.toHaveBeenCalled();
        });

        it("throws when user is already in the project", async () => {
            getDocs.mockResolvedValueOnce({ empty: true });
            getDoc.mockResolvedValueOnce({ exists: () => true });

            await expect(inviteService.sendInvite({
                senderId: "u1",
                senderEmail: "u1@test.com",
                receiverId: "u2",
                projectId: "p1",
                projectName: "Project",
            })).rejects.toThrow("This user is already in this project");

            expect(addDoc).not.toHaveBeenCalled();
        });

        it("creates an invite with createdAt timestamp", async () => {
            getDocs.mockResolvedValueOnce({ empty: true });
            getDoc.mockResolvedValueOnce({ exists: () => false });

            await inviteService.sendInvite({
                senderId: "u1",
                senderEmail: "u1@test.com",
                receiverId: "u2",
                projectId: "p1",
                projectName: "Project",
            });

            expect(where).toHaveBeenCalledWith("projectId", "==", "p1");
            expect(addDoc).toHaveBeenCalledWith("users/u2/invites", {
                senderId: "u1",
                senderEmail: "u1@test.com",
                projectId: "p1",
                projectName: "Project",
                createdAt: "mocked-now",
            });
        });
    });

    describe("acceptInvite", () => {
        it("deletes invite and throws when project no longer exists", async () => {
            runTransaction.mockImplementation(async (_db, cb) => {
                const txn = {
                    get: jest.fn().mockResolvedValue({ exists: () => false }),
                    delete: jest.fn(),
                    set: jest.fn(),
                };
                await cb(txn);
            });

            await expect(inviteService.acceptInvite("u1", "u1@test.com", {
                id: "i1",
                projectId: "p1",
            })).rejects.toThrow("This project no longer exists. Project may have been deleted after the invite was sent.");

            const txn = runTransaction.mock.calls[0][1];
            expect(pathHelper.userInvite).toHaveBeenCalledWith("u1", "i1");
            expect(pathHelper.project).toHaveBeenCalledWith("p1");
        });

        it("adds user to project and project to user, deleting the invite", async () => {
            getDocs.mockResolvedValueOnce({ docs: [] });
            const txn = {
                get: jest.fn().mockResolvedValue({
                    exists: () => true,
                    data: () => ({ title: "Proj", description: "Desc" }),
                }),
                delete: jest.fn(),
                set: jest.fn(),
            };

            runTransaction.mockImplementation(async (_db, cb) => {
                await cb(txn);
            });

            await inviteService.acceptInvite("u1", "u1@test.com", {
                id: "i1",
                projectId: "p1",
            });

            expect(txn.delete).toHaveBeenCalledWith("users/u1/invites/i1");
            expect(txn.set).toHaveBeenCalledWith("users/u1/projects/p1", {
                title: "Proj",
                description: "Desc",
                order: 0,
            });
            expect(txn.set).toHaveBeenCalledWith("projects/p1/users/u1", {
                email: "u1@test.com",
            });
        });
    });

    describe("ignoreInvite", () => {
        it("deletes the invite document", async () => {
            await inviteService.ignoreInvite("u1", "i1");
            expect(deleteDoc).toHaveBeenCalledWith("users/u1/invites/i1");
        });
    });
});
