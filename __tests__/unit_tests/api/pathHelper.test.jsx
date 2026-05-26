import { jest, describe, it, expect } from '@jest/globals'
import { pathHelper } from "../../../api/pathHelper"

jest.mock("firebase/firestore", () => ({
    doc: jest.fn((db, ...args) => args.join("/")),
    collection: jest.fn((db, ...args) => args.join("/"))
}))

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: {
        USERS: "users",
        PROJECTS: "projects",
        TEMPLATES: "templates",
        ADMIN: "admin",
    },
    SUBCOLLECTIONS: {
        USER_INVITES: "userInvites",
        USER_PROJECTS: "userProjects",
        USER_TASKS: "userTasks",
        PROJECT_USERS: "projectUsers",
        PROJECT_COLUMNS: "projectColumns",
        COLUMN_TASKS: "columnTasks",
        TEMPLATE_COLUMNS: "templateColumns",
        TEMPLATE_COLUMN_TASKS: "templateColumnTasks",
        SUGGESTIONS: "suggestions",
    }
}))

jest.mock("../../../firebase/firebaseConfig", () => ({
    db: {}
}))

describe("pathHelper", () => {

    it("generates correct paths for admin related items", () => {
        expect(pathHelper.admin("a1")).toBe("admin/a1")
    })

    it("generates correct paths for all user related items", () => {
        expect(pathHelper.user("u1")).toBe("users/u1")
        expect(pathHelper.userInvites("u1")).toBe("users/u1/userInvites")
        expect(pathHelper.userInvite("u1", "i1")).toBe("users/u1/userInvites/i1")
        expect(pathHelper.userProjects("u1")).toBe("users/u1/userProjects")
        expect(pathHelper.userProject("u1", "p1")).toBe("users/u1/userProjects/p1")
        expect(pathHelper.userTasks("u1")).toBe("users/u1/userTasks")
        expect(pathHelper.userTask("u1", "t1")).toBe("users/u1/userTasks/t1")
    })

    it("generates correct paths for all project related items", () => {
        expect(pathHelper.project("p1")).toBe("projects/p1")
        expect(pathHelper.projectUser("p1", "u1")).toBe("projects/p1/projectUsers/u1")
        expect(pathHelper.projectUsers("p1")).toBe("projects/p1/projectUsers")
        expect(pathHelper.projectColumns("p1")).toBe("projects/p1/projectColumns")
        expect(pathHelper.projectColumn("p1", "c1")).toBe("projects/p1/projectColumns/c1")
        expect(pathHelper.columnTasks("p1", "c1")).toBe("projects/p1/projectColumns/c1/columnTasks")
        expect(pathHelper.columnTask("p1", "c1", "t1")).toBe("projects/p1/projectColumns/c1/columnTasks/t1")
    })

    it("generates correct paths for all template related items", () => {
        expect(pathHelper.template("t1")).toBe("templates/t1")
        expect(pathHelper.templateColumns("t1")).toBe("templates/t1/templateColumns")
        expect(pathHelper.templateColumn("t1", "c1")).toBe("templates/t1/templateColumns/c1")
        expect(pathHelper.templateColumnTasks("t1", "c1")).toBe("templates/t1/templateColumns/c1/templateColumnTasks")
        expect(pathHelper.templateColumnTask("t1", "c1", "tk1")).toBe("templates/t1/templateColumns/c1/templateColumnTasks/tk1")
    })

    it("generates correct paths for all suggestion related items", () => {
        expect(pathHelper.adminSuggestions("a1")).toBe("admin/a1/suggestions")
        expect(pathHelper.adminSuggestion("a1", "s1")).toBe("admin/a1/suggestions/s1")
    })
})