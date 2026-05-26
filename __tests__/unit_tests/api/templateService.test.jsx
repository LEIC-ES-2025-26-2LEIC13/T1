import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { templateService } from "../../../api/templateService";
import { collection, doc, getDoc, getDocs, onSnapshot, writeBatch } from "firebase/firestore";
import { batchOps } from "../../../api/batchOpsHelper";
import { pathHelper } from "../../../api/pathHelper";
import { templateColumnService } from "../../../api/templateColumnService";
import { projectService } from "../../../api/projectService";
import { columnService } from "../../../api/columnService";
import { taskService } from "../../../api/taskService";

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn((ref) => ref),
    writeBatch: jest.fn(),
}));

jest.mock("../../../api/batchOpsHelper", () => ({
    batchOps: jest.fn().mockResolvedValue(undefined),
    OPERATION_TYPES: { DELETE: "DELETE", UPDATE: "UPDATE", SET: "SET" },
}));

jest.mock("../../../api/pathHelper", () => ({
    pathHelper: {
        template: jest.fn(),
        templateColumns: jest.fn(),
        templateColumnTasks: jest.fn(),
    },
}));

jest.mock("../../../api/templateColumnService", () => ({
    templateColumnService: {
        allColumnsRefsToDelete: jest.fn(),
    },
}));

jest.mock("../../../api/projectService", () => ({
    projectService: {
        createProject: jest.fn(),
        updateProject: jest.fn(),
    },
}));

jest.mock("../../../api/columnService", () => ({
    columnService: {
        createColumn: jest.fn(),
    },
}));

jest.mock("../../../api/taskService", () => ({
    taskService: {
        createTask: jest.fn(),
    },
}));

jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));

jest.mock("../../../constants/Collections", () => ({
    COLLECTIONS: { TEMPLATES: "templates" },
}));

function makeDoc(id, data) {
    return { id, data: () => data };
}

describe("templateService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("subscribeToAllTemplates", () => {
        it("maps template docs and returns unsubscribe", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({ docs: [makeDoc("t1", { title: "Temp" })] });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = templateService.subscribeToAllTemplates(onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([{ id: "t1", title: "Temp" }]);
            expect(result).toBe(unsub);
        });
    });

    describe("getTemplateProjects", () => {
        it("returns mapped templates", async () => {
            getDocs.mockResolvedValueOnce({
                docs: [makeDoc("t1", { title: "Temp" }), makeDoc("t2", { title: "Other" })],
            });

            const result = await templateService.getTemplateProjects();

            expect(result).toEqual([
                { id: "t1", title: "Temp" },
                { id: "t2", title: "Other" },
            ]);
        });
    });

    describe("createTemplate", () => {
        it("throws when title is empty", async () => {
            await expect(
                templateService.createTemplate({ title: " ", description: "x" })
            ).rejects.toThrow("Please enter a template title");
        });

        it("creates template with columnCount 0", async () => {
            const batch = { set: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) };
            writeBatch.mockReturnValue(batch);
            doc.mockReturnValue("templateRef");
            collection.mockReturnValue("templates");

            await templateService.createTemplate({ title: "Temp", description: "Desc" });

            expect(batch.set).toHaveBeenCalledWith("templateRef", {
                title: "Temp",
                description: "Desc",
                columnCount: 0,
            });
            expect(batch.commit).toHaveBeenCalled();
        });
    });

    describe("copyTemplate", () => {
        it("copies columns and tasks from template", async () => {
            projectService.createProject.mockResolvedValueOnce({ id: "p1" });
            projectService.updateProject.mockResolvedValueOnce(undefined);
            columnService.createColumn.mockResolvedValueOnce({ id: "new-col" });

            pathHelper.templateColumns.mockReturnValue("templateColsRef");
            pathHelper.templateColumnTasks.mockReturnValue("templateTasksRef");

            getDocs
                .mockResolvedValueOnce({
                    docs: [makeDoc("c1", { name: "Todo" })],
                })
                .mockResolvedValueOnce({
                    docs: [makeDoc("t1", { name: "Task", description: "Desc", hints: "hint" })],
                });

            await templateService.copyTemplate(
                { id: "tmpl-1", title: "Template A" },
                "user-1",
                "user@test.com"
            );

            expect(projectService.updateProject).toHaveBeenCalledWith("p1", { templateId: "tmpl-1" });
            expect(columnService.createColumn).toHaveBeenCalledWith("p1", { name: "Todo" });
            expect(taskService.createTask).toHaveBeenCalledWith(
                "p1",
                "Template A",
                "new-col",
                "Todo",
                {
                    name: "Task",
                    description: "Desc",
                    label: "",
                    assignedMembers: [],
                    hints: "hint",
                }
            );
        });
    });

    describe("updateTemplate", () => {
        it("returns early when no updates provided", async () => {
            await templateService.updateTemplate("t1", {});
            expect(batchOps).not.toHaveBeenCalled();
        });

        it("throws when title is empty after trim", async () => {
            await expect(
                templateService.updateTemplate("t1", { title: "   " })
            ).rejects.toThrow("Template title cannot be empty");
        });

        it("updates description when provided", async () => {
            doc.mockReturnValue("templateRef");

            await templateService.updateTemplate("t1", { description: "  New  " });

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                [{
                    type: "UPDATE",
                    ref: "templateRef",
                    data: { description: "New" },
                }]
            );
        });
    });

    describe("deleteTemplate", () => {
        it("deletes columns and the template doc", async () => {
            templateColumnService.allColumnsRefsToDelete.mockResolvedValueOnce([
                { type: "DELETE", ref: "colRef" },
            ]);
            doc.mockReturnValue("templateRef");

            await templateService.deleteTemplate("t1");

            expect(batchOps).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    { type: "DELETE", ref: "colRef" },
                    { type: "DELETE", ref: "templateRef" },
                ])
            );
        });
    });

    describe("getTemplate", () => {
        it("returns null when template not found", async () => {
            pathHelper.template.mockReturnValue("templateRef");
            getDoc.mockResolvedValueOnce({ exists: () => false });

            const result = await templateService.getTemplate("t1");
            expect(result).toBeNull();
        });

        it("returns template data when found", async () => {
            pathHelper.template.mockReturnValue("templateRef");
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                id: "t1",
                data: () => ({ title: "Temp" }),
            });

            const result = await templateService.getTemplate("t1");
            expect(result).toEqual({ id: "t1", title: "Temp" });
        });
    });

    describe("subscribeToTemplateColumns", () => {
        it("maps columns for a template", () => {
            const unsub = jest.fn();
            onSnapshot.mockImplementation((_q, cb) => {
                cb({ docs: [makeDoc("c1", { name: "Col" })] });
                return unsub;
            });

            const onUpdate = jest.fn();
            const result = templateService.subscribeToTemplateColumns("t1", onUpdate);

            expect(onUpdate).toHaveBeenCalledWith([{ id: "c1", name: "Col" }]);
            expect(result).toBe(unsub);
        });
    });

    describe("reorderTemplates", () => {
        it("updates order for each template", async () => {
            const batch = { update: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) };
            writeBatch.mockReturnValue(batch);
            pathHelper.template.mockImplementation((id) => `template/${id}`);

            await templateService.reorderTemplates([{ id: "t1" }, { id: "t2" }]);

            expect(batch.update).toHaveBeenCalledWith("template/t1", { order: 0 });
            expect(batch.update).toHaveBeenCalledWith("template/t2", { order: 1 });
            expect(batch.commit).toHaveBeenCalled();
        });
    });
});
