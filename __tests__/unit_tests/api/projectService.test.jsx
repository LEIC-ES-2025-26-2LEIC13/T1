import { jest, beforeEach, describe, test, expect } from "@jest/globals";

// Mocks
jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: "mock-project-id" })),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    writeBatch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        commit: jest.fn(),
    })),
    where: jest.fn(),
}));

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn(),
    OPERATION_TYPES: { DELETE: "DELETE", UPDATE: "UPDATE", SET: "SET" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        userProjects: jest.fn(() => "userProjectsRef"),
        userProject: jest.fn(() => "userProjectRef"),
        projectUsers: jest.fn(() => "projectUsersRef"),
        userProject: jest.fn(() => "userProjectRef"),
        projectUser: jest.fn(() => "projectUserRef"),
        userTasks: jest.fn(() => "userTasksRef"),
        columnTask: jest.fn(() => "columnTaskRef"),
    },
}));

jest.mock("../../../api/columnService", () => ({
    columnService: {
        allColumnsRefsToDelete: jest.fn(() => Promise.resolve([])),
    },
}));

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: { PROJECTS: "projects", USERS: "users" },
    SUBCOLLECTIONS: { PROJECT_USERS: "projectUsers", USER_PROJECTS: "userProjects" },
}));

import { onSnapshot, getDocs, getDoc, writeBatch, doc, collection } from "firebase/firestore";
import { batchOps } from "../../../api/batchOpsHelper";
import { columnService } from "../../../api/columnService";
import { projectService } from "../../../api/projectService";

function makeSnapshot(docs) {
    const mappedDocs = docs.map((d) => ({
        id: d.id,
        ref: { id: d.id },
        data: () => d,
    }));
    return {
        docs: mappedDocs,
        empty: docs.length === 0,
        forEach: (cb) => mappedDocs.forEach(cb),
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("projectService", () => {

    // subscribeToUserProjects

    describe("subscribeToUserProjects", () => {
        test("calls onSnapshot and returns unsubscribe", () => {
            const unsubscribe = jest.fn();
            onSnapshot.mockReturnValueOnce(unsubscribe);

            const result = projectService.subscribeToUserProjects("user-1", jest.fn());

            expect(onSnapshot).toHaveBeenCalled();
            expect(result).toBe(unsubscribe);
        });

        test("calls onUpdate with mapped project data", () => {
            onSnapshot.mockImplementationOnce((_, callback) => {
                callback(makeSnapshot([{ id: "p1", title: "Project 1" }]));
                return jest.fn();
            });

            const onUpdate = jest.fn();
            projectService.subscribeToUserProjects("user-1", onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([{ id: "p1", title: "Project 1" }]);
        });
    });

    // createProject

    describe("createProject", () => {
        test("commits batch and returns projectRef", async () => {
            const mockBatch = { set: jest.fn(), commit: jest.fn() };
            writeBatch.mockReturnValueOnce(mockBatch);
            doc.mockReturnValue({ id: "new-project-id" });
            collection.mockReturnValue("projectsCollection");
            getDocs.mockResolvedValueOnce(makeSnapshot([]));

            const result = await projectService.createProject("user-1", "user@example.com", {
                title: "My Project",
                description: "A description",
            });

            expect(mockBatch.set).toHaveBeenCalled();
            expect(mockBatch.commit).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        test("sets correct order based on existing user projects count", async () => {
            const mockBatch = { set: jest.fn(), commit: jest.fn() };
            writeBatch.mockReturnValueOnce(mockBatch);
            doc.mockReturnValue({ id: "new-project-id" });
            collection.mockReturnValue("projectsCollection");
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "p1" }, { id: "p2" }]));

            await projectService.createProject("user-1", "user@example.com", {
                title: "My Project",
                description: "",
            });

            const userProjectSetCall = mockBatch.set.mock.calls.find(
                (call) => call[1]?.order !== undefined
            );
            expect(userProjectSetCall[1].order).toBe(2);
        });

        test("throws when title is empty", async () => {
            await expect(
                projectService.createProject("user-1", "user@example.com", { title: "", description: "" })
            ).rejects.toThrow("Please enter a project title");
        });

        test("throws when title is only whitespace", async () => {
            await expect(
                projectService.createProject("user-1", "user@example.com", { title: "   ", description: "" })
            ).rejects.toThrow("Please enter a project title");
        });
    });

    // updateProject

    describe("updateProject", () => {
        test("calls batchOps with update operations", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "user-1" }]));

            await projectService.updateProject("project-1", {
                title: "Updated Title",
                description: "Updated description",
            });

            expect(batchOps).toHaveBeenCalled();
        });

        test("includes templateId in update when provided", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "user-1" }]));

            await projectService.updateProject("project-1", { templateId: "t1" });

            const ops = batchOps.mock.calls[0][1];
            expect(ops[0].data.templateId).toBe("t1");
        });

        test("throws when title is empty", async () => {
            await expect(
                projectService.updateProject("project-1", { title: "" })
            ).rejects.toThrow("Project title cannot be empty");
        });

        test("throws when title is only whitespace", async () => {
            await expect(
                projectService.updateProject("project-1", { title: "   " })
            ).rejects.toThrow("Project title cannot be empty");
        });

        test("returns early when no fields provided", async () => {
            await projectService.updateProject("project-1", {});

            expect(batchOps).not.toHaveBeenCalled();
        });
    });

    // deleteProject

    describe("deleteProject", () => {
        test("calls allColumnsRefsToDelete and batchOps", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "user-1" }]));

            await projectService.deleteProject("project-1");

            expect(columnService.allColumnsRefsToDelete).toHaveBeenCalledWith("project-1");
            expect(batchOps).toHaveBeenCalled();
        });

        test("queues delete operations for all project users", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "user-1" }, { id: "user-2" }]));

            await projectService.deleteProject("project-1");

            const ops = batchOps.mock.calls[0][1];
            const deleteOps = ops.filter((o) => o.type === "DELETE");
            expect(deleteOps.length).toBeGreaterThanOrEqual(5);
        });
    });

    // getProjectUsers

    describe("getProjectUsers", () => {
        test("returns mapped list of users", async () => {
            getDocs.mockResolvedValueOnce(
                makeSnapshot([
                    { id: "u1", email: "a@example.com" },
                    { id: "u2", email: "b@example.com" },
                ])
            );

            const users = await projectService.getProjectUsers("project-1");

            expect(users).toEqual([
                { id: "u1", email: "a@example.com" },
                { id: "u2", email: "b@example.com" },
            ]);
        });

        test("returns empty array when no users", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([]));

            const users = await projectService.getProjectUsers("project-1");

            expect(users).toEqual([]);
        });
    });

    // kickMember

    describe("kickMember", () => {
        test("calls batchOps with delete and update operations", async () => {
            getDocs.mockResolvedValueOnce(
                makeSnapshot([{ id: "task-1", columnId: "col-1", assignedMembers: [{ id: "user-1" }] }])
            );

            await projectService.kickMember("project-1", "user-1");

            expect(batchOps).toHaveBeenCalled();
            const ops = batchOps.mock.calls[0][1];
            expect(ops.some((o) => o.type === "DELETE")).toBe(true);
            expect(ops.some((o) => o.type === "UPDATE")).toBe(true);
        });

        test("removes kicked member from assignedMembers", async () => {
            getDocs.mockResolvedValueOnce(
                makeSnapshot([{
                    id: "task-1",
                    columnId: "col-1",
                    assignedMembers: [{ id: "user-1" }, { id: "user-2" }],
                }])
            );

            await projectService.kickMember("project-1", "user-1");

            const ops = batchOps.mock.calls[0][1];
            const updateOp = ops.find((o) => o.type === "UPDATE");
            expect(updateOp.data.assignedMembers).toEqual([{ id: "user-2" }]);
        });

        test("works when user has no assigned tasks", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([]));

            await projectService.kickMember("project-1", "user-1");

            expect(batchOps).toHaveBeenCalled();
        });
    });

    // projectHasNoMembers

    describe("projectHasNoMembers", () => {
        test("returns true when no members", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([]));

            const result = await projectService.projectHasNoMembers("project-1");

            expect(result).toBe(true);
        });

        test("returns false when members exist", async () => {
            getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "u1" }]));

            const result = await projectService.projectHasNoMembers("project-1");

            expect(result).toBe(false);
        });
    });

    // reorderUserProjects

    describe("reorderUserProjects", () => {
        test("commits batch with correct order for each project", async () => {
            const mockBatch = { update: jest.fn(), commit: jest.fn() };
            writeBatch.mockReturnValueOnce(mockBatch);

            const projects = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
            await projectService.reorderUserProjects("user-1", projects);

            expect(mockBatch.update).toHaveBeenCalledTimes(3);
            expect(mockBatch.update).toHaveBeenNthCalledWith(1, "userProjectRef", { order: 0 });
            expect(mockBatch.update).toHaveBeenNthCalledWith(2, "userProjectRef", { order: 1 });
            expect(mockBatch.update).toHaveBeenNthCalledWith(3, "userProjectRef", { order: 2 });
            expect(mockBatch.commit).toHaveBeenCalled();
        });

        test("throws when userId is missing", async () => {
            await expect(
                projectService.reorderUserProjects(null, [])
            ).rejects.toThrow("User ID is required to reorder projects");
        });
    });

    // isProjectFromTemplate

    describe("isProjectFromTemplate", () => {
        test("returns true when project has a templateId", async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ templateId: "t1" }),
            });

            const result = await projectService.isProjectFromTemplate("project-1");

            expect(result).toBe(true);
        });

        test("returns false when project has no templateId", async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ title: "My Project" }),
            });

            const result = await projectService.isProjectFromTemplate("project-1");

            expect(result).toBe(false);
        });

        test("throws when project does not exist", async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => false,
            });

            await expect(
                projectService.isProjectFromTemplate("project-1")
            ).rejects.toThrow("Project not found");
        });
    });
});