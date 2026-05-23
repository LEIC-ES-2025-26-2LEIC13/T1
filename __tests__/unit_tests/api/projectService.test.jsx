import { jest, beforeEach, describe, test, expect } from "@jest/globals";

import { onSnapshot, getDocs, orderBy, writeBatch, doc, collection } from "firebase/firestore";
import { batchOps } from "../../../api/batchOpsHelper";
import { columnService } from "../../../api/columnService";
import { projectService } from "../../../api/projectService";
import { pathHelper } from "../../../api/pathHelper";

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(() => ({ id: "mock-project-id" })),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    getDocs: jest.fn(),
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
        projectUsers: jest.fn(() => "projectUsersRef"),
        userProject: jest.fn((userId, projectId) => `userProject:${userId}:${projectId}`),
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
    getDocs.mockResolvedValue(makeSnapshot([]));
});

describe("projectService", () => {

    // subscribeToUserProjects

    test("subscribeToUserProjects calls onSnapshot and returns unsubscribe", () => {
        const unsubscribe = jest.fn();
        onSnapshot.mockReturnValueOnce(unsubscribe);

        const onUpdate = jest.fn();
        const result = projectService.subscribeToUserProjects("user-1", onUpdate);

        expect(onSnapshot).toHaveBeenCalled();
        expect(result).toBe(unsubscribe);
    });

    test("subscribeToUserProjects calls onUpdate with mapped project data", () => {
        onSnapshot.mockImplementationOnce((_, callback) => {
            callback(makeSnapshot([{ id: "p1", title: "Project 1" }]));
            return jest.fn();
        });

        const onUpdate = jest.fn();
        projectService.subscribeToUserProjects("user-1", onUpdate);

        expect(onUpdate).toHaveBeenCalledWith([{ id: "p1", title: "Project 1" }]);
    });

    test("subscribeToUserProjects queries projects ordered by order", () => {
        onSnapshot.mockImplementationOnce((_, callback) => {
            callback(makeSnapshot([
                { id: "p2", title: "Project 2", order: 2 },
                { id: "p1", title: "Project 1", order: 1 },
                { id: "p3", title: "Legacy Project" },
            ]));
            return jest.fn();
        });

        const onUpdate = jest.fn();
        projectService.subscribeToUserProjects("user-1", onUpdate);

        expect(orderBy).toHaveBeenCalledWith("order", "asc");
    });

    // createProject

    test("createProject commits batch with correct data", async () => {
        const mockBatch = { set: jest.fn(), commit: jest.fn() };
        writeBatch.mockReturnValueOnce(mockBatch);
        doc.mockReturnValue({ id: "new-project-id" });
        collection.mockReturnValue("projectsCollection");
        getDocs.mockResolvedValueOnce(makeSnapshot([]));

        await projectService.createProject("user-1", "user@example.com", {
            title: "My Project",
            description: "A description",
        });

        expect(mockBatch.set).toHaveBeenCalled();
        expect(mockBatch.commit).toHaveBeenCalled();
    });

    test("createProject throws when title is empty", async () => {
        await expect(
            projectService.createProject("user-1", "user@example.com", {
                title: "",
                description: "",
            })
        ).rejects.toThrow("Please enter a project title");
    });

    test("createProject throws when title is only whitespace", async () => {
        await expect(
            projectService.createProject("user-1", "user@example.com", {
                title: "   ",
                description: "",
            })
        ).rejects.toThrow("Please enter a project title");
    });

    test("createProject stores the next order in userProjects", async () => {
        const mockBatch = { set: jest.fn(), commit: jest.fn() };
        writeBatch.mockReturnValueOnce(mockBatch);
        doc.mockReturnValue({ id: "new-project-id" });
        collection.mockReturnValue("projectsCollection");
        getDocs.mockResolvedValueOnce(makeSnapshot([
            { id: "p1", title: "Project 1", order: 0 },
            { id: "p2", title: "Project 2", order: 2 },
        ]));

        await projectService.createProject("user-1", "user@example.com", {
            title: "My Project",
            description: "A description",
        });

        const userProjectSet = mockBatch.set.mock.calls[2][1];
        expect(userProjectSet.order).toBe(2);
    });

    // reorderUserProjects

    test("reorderUserProjects updates order for each user project", async () => {
        const mockBatch = { update: jest.fn(), commit: jest.fn() };
        writeBatch.mockReturnValueOnce(mockBatch);

        await projectService.reorderUserProjects("user-1", [
            { id: "p2" },
            { id: "p1" },
        ]);

        expect(pathHelper.userProject).toHaveBeenNthCalledWith(1, "user-1", "p2");
        expect(pathHelper.userProject).toHaveBeenNthCalledWith(2, "user-1", "p1");
        expect(mockBatch.update).toHaveBeenNthCalledWith(1, "userProject:user-1:p2", { order: 0 });
        expect(mockBatch.update).toHaveBeenNthCalledWith(2, "userProject:user-1:p1", { order: 1 });
        expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    // updateProject

    test("updateProject calls batchOps with update operations", async () => {
        getDocs.mockResolvedValueOnce(
            makeSnapshot([{ id: "user-1", email: "u@example.com" }])
        );

        await projectService.updateProject("project-1", {
            title: "Updated Title",
            description: "Updated description",
        });

        expect(batchOps).toHaveBeenCalled();
    });

    test("updateProject throws when title is empty string", async () => {
        await expect(
            projectService.updateProject("project-1", { title: "" })
        ).rejects.toThrow("Project title cannot be empty");
    });

    test("updateProject throws when title is only whitespace", async () => {
        await expect(
            projectService.updateProject("project-1", { title: "   " })
        ).rejects.toThrow("Project title cannot be empty");
    });

    test("updateProject returns early when no fields provided", async () => {
        await projectService.updateProject("project-1", {});

        expect(batchOps).not.toHaveBeenCalled();
    });

    // deleteProject

    test("deleteProject calls allColumnsRefsToDelete and batchOps", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([{ id: "user-1" }]));

        await projectService.deleteProject("project-1");

        expect(columnService.allColumnsRefsToDelete).toHaveBeenCalledWith("project-1");
        expect(batchOps).toHaveBeenCalled();
    });

    test("deleteProject queues delete operations for all project users", async () => {
        getDocs.mockResolvedValueOnce(
            makeSnapshot([{ id: "user-1" }, { id: "user-2" }])
        );

        await projectService.deleteProject("project-1");

        const ops = batchOps.mock.calls[0][1];
        const deleteOps = ops.filter((o) => o.type === "DELETE");
        // 2 projectUsers docs + 2 userProject refs + 1 main project = 5
        expect(deleteOps.length).toBeGreaterThanOrEqual(5);
    });

    // getProjectUsers

    test("getProjectUsers returns mapped list of users", async () => {
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

    test("getProjectUsers returns empty array when no users", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([]));

        const users = await projectService.getProjectUsers("project-1");

        expect(users).toEqual([]);
    });

    // kickMember

    test("kickMember calls batchOps with delete and update operations", async () => {
        getDocs.mockResolvedValueOnce(
            makeSnapshot([
                {
                    id: "task-1",
                    columnId: "col-1",
                    assignedMembers: [{ id: "user-1" }, { id: "user-2" }],
                },
            ])
        );

        await projectService.kickMember("project-1", "user-1");

        expect(batchOps).toHaveBeenCalled();
        const ops = batchOps.mock.calls[0][1];
        expect(ops.some((o) => o.type === "DELETE")).toBe(true);
        expect(ops.some((o) => o.type === "UPDATE")).toBe(true);
    });

    test("kickMember removes kicked member from assignedMembers", async () => {
        getDocs.mockResolvedValueOnce(
            makeSnapshot([
                {
                    id: "task-1",
                    columnId: "col-1",
                    assignedMembers: [{ id: "user-1" }, { id: "user-2" }],
                },
            ])
        );

        await projectService.kickMember("project-1", "user-1");

        const ops = batchOps.mock.calls[0][1];
        const updateOp = ops.find((o) => o.type === "UPDATE");
        expect(updateOp.data.assignedMembers).toEqual([{ id: "user-2" }]);
    });

    test("kickMember works when user has no assigned tasks", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([]));

        await projectService.kickMember("project-1", "user-1");

        expect(batchOps).toHaveBeenCalled();
    });

    // projectHasNoMembers
    test("projectHasNoMembers returns true when no members", async () => {
        getDocs.mockResolvedValueOnce(makeSnapshot([]));

        const result = await projectService.projectHasNoMembers("project-1");

        expect(result).toBe(true);
    });

    test("projectHasNoMembers returns false when members exist", async () => {
        getDocs.mockResolvedValueOnce(
            makeSnapshot([{ id: "u1", email: "a@example.com" }])
        );

        const result = await projectService.projectHasNoMembers("project-1");

        expect(result).toBe(false);
    });
});