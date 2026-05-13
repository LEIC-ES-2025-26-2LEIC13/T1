import { jest, describe, it, expect } from '@jest/globals'
import { pathHelper } from "../../../api/pathHelper"

jest.mock("firebase/firestore", () => ({
    doc: jest.fn((db, ...args) => args.join("/")),
    collection: jest.fn((db, ...args) => args.join("/"))
}))

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: {
        USERS: "users",
        PROJECTS: "projects"
    },
    SUBCOLLECTIONS: {
        USER_INVITES: "invites",
        USER_PROJECTS: "user_projects",
        USER_TASKS: "user_tasks",        // ← was missing
        PROJECT_USERS: "project_users",
        PROJECT_COLUMNS: "columns",
        COLUMN_TASKS: "tasks"
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {}
}))

describe("pathHelper", () => {
    it("should generate correct paths for all user related items", () => {
        expect(pathHelper.user("u1")).toBe("users/u1")
        expect(pathHelper.userInvites("u1")).toBe("users/u1/invites")
        expect(pathHelper.userInvite("u1", "i1")).toBe("users/u1/invites/i1")
        expect(pathHelper.userProjects("u1")).toBe("users/u1/user_projects")
        expect(pathHelper.userProject("u1", "p1")).toBe("users/u1/user_projects/p1")
        expect(pathHelper.userTasks("u1")).toBe("users/u1/user_tasks")          // ← missing test
        expect(pathHelper.userTask("u1", "t1")).toBe("users/u1/user_tasks/t1")  // ← missing test
    })

    it("should generate correct paths for all project related items", () => {
        expect(pathHelper.project("p1")).toBe("projects/p1")
        expect(pathHelper.projectUser("p1", "u1")).toBe("projects/p1/project_users/u1")
        expect(pathHelper.projectUsers("p1")).toBe("projects/p1/project_users")
        expect(pathHelper.projectColumns("p1")).toBe("projects/p1/columns")
        expect(pathHelper.projectColumn("p1", "c1")).toBe("projects/p1/columns/c1")
        expect(pathHelper.columnTasks("p1", "c1")).toBe("projects/p1/columns/c1/tasks")
        expect(pathHelper.columnTask("p1", "c1", "t1")).toBe("projects/p1/columns/c1/tasks/t1")  // ← was pathHelper.task
    })
})