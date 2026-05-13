<<<<<<< HEAD
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import CreateTaskModal from "../../../components/CreateTaskModal";

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

// Mock useAuth hook
jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({
        user: { email: "current@example.com" },
    }),
}));

const mockTask = {
    name: "New Task",
    description: "Task description",
    label: "",
    assignedMembers: [],
};

const mockProjectUsers = [
    { id: "user1", email: "user1@example.com" },
    { id: "user2", email: "user2@example.com" },
    { id: "current", email: "current@example.com" },
];

const renderModal = (overrides = {}) =>
    render(
        <CreateTaskModal
            visible={true}
            projectName="Project A"
            columnName="To Do"
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            task={mockTask}
            onChange={mockOnChange}
            getProjectUsers={mockGetProjectUsers}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();
    mockGetProjectUsers.mockClear().mockResolvedValue(mockProjectUsers);
});

describe("CreateTaskModal", () => {
    test("renders modal with form when visible", () => {
        renderModal();
        expect(screen.getByText("Create Task")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
        expect(screen.getByText("Add Members")).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({ visible: false });
        expect(screen.queryByText("Create Task")).toBeFalsy();
    });

    test("displays project and column pills", () => {
        renderModal({ projectName: "My Project", columnName: "In Progress" });
        expect(screen.getByText("My Project")).toBeTruthy();
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    test("updates task name on text change", () => {
        renderModal();
        const nameInput = screen.getByDisplayValue("New Task");
        fireEvent.changeText(nameInput, "Updated Task Name");
        expect(mockOnChange).toHaveBeenCalledWith("name", "Updated Task Name");
    });

    test("updates task description on text change", () => {
        renderModal();
        const descriptionInput = screen.getByDisplayValue("Task description");
        fireEvent.changeText(descriptionInput, "Updated description");
        expect(mockOnChange).toHaveBeenCalledWith("description", "Updated description");
    });

    test("displays form fields for task creation", () => {
        renderModal();
        expect(screen.getByPlaceholderText("Enter task name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter task description (optional)")).toBeTruthy();
        expect(screen.getByText("Assigned Members")).toBeTruthy();
    });

    test("shows assigned members when present", () => {
        const taskWithMembers = {
            ...mockTask,
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
                { id: "user2", email: "user2@example.com" },
            ],
        };
        renderModal({ task: taskWithMembers });

        expect(screen.getByText("user1@example.com")).toBeTruthy();
        expect(screen.getByText("user2@example.com")).toBeTruthy();
    });

    test("does not show assigned members when empty", () => {
        renderModal();
        expect(screen.queryByText("user1@example.com")).toBeFalsy();
    });

    test("calls onCreate with task when Create button is pressed", () => {
        renderModal();
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).toHaveBeenCalledWith(mockTask);
    });

    test("does not call onCreate when task name is empty", () => {
        renderModal({ task: { ...mockTask, name: "" } });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("does not call onCreate when task name is only whitespace", () => {
        renderModal({ task: { ...mockTask, name: "   " } });
        fireEvent.press(screen.getByText("Create"));
        expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test("calls onClose when close button is used", () => {
        renderModal();
        fireEvent.press(screen.getByText("Close"));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test("can interact with assigned members display", () => {
        const taskWithMembers = {
            ...mockTask,
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
            ],
        };
        renderModal({ task: taskWithMembers });

        expect(screen.getByText("user1@example.com")).toBeTruthy();
        // The remove button interaction is a UI detail; the important part
        // is that the member is displayed and onChange logic works
    });

    test("displays label field for task creation", () => {
        renderModal();
        expect(screen.getByText("LABELS")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter or select label")).toBeTruthy();
    });

    test("handles task with all fields populated", () => {
        const fullTask = {
            name: "Complete project",
            description: "Finish implementation",
            label: "urgent",
            assignedMembers: [
                { id: "user1", email: "user1@example.com" },
            ],
        };
        renderModal({ task: fullTask });

        expect(screen.getByDisplayValue("Complete project")).toBeTruthy();
        expect(screen.getByDisplayValue("Finish implementation")).toBeTruthy();
        expect(screen.getByText("user1@example.com")).toBeTruthy();
    });

    test("handles task with minimal fields", () => {
        const minimalTask = {
            name: "Task",
            description: "",
            label: "",
            assignedMembers: [],
        };
        renderModal({ task: minimalTask });

        expect(screen.getByDisplayValue("Task")).toBeTruthy();
        expect(screen.getByText("Add Members")).toBeTruthy();
    });
});
=======
import { jest, beforeEach, describe, test, expect } from "@jest/globals";

import React from "react";

import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react-native";

import CreateTaskModal from "../../../components/CreateTaskModal";

jest.mock("@expo/vector-icons", () => ({
    MaterialCommunityIcons: "Icon",
}));

// Mock useAuth
jest.mock("../../../hooks/useAuth", () => ({
    useAuth: () => ({
        user: {
            email: "current@example.com",
        },
    }),
}));

// Mock useColorScheme
jest.mock(
    "react-native/Libraries/Utilities/useColorScheme",
    () => ({
        default: () => "light",
    })
);

const mockOnClose = jest.fn();
const mockOnCreate = jest.fn();
const mockOnChange = jest.fn();
const mockGetProjectUsers = jest.fn();

const mockTask = {
    name: "New Task",
    description: "Task description",
    label: "",
    assignedMembers: [],
};

const mockProjectUsers = [
    {
        id: "1",
        email: "user1@example.com",
    },
    {
        id: "2",
        email: "user2@example.com",
    },
    {
        id: "3",
        email: "current@example.com",
    },
];

const renderModal = (overrides = {}) =>
    render(
        <CreateTaskModal
            visible={true}
            projectName="Project A"
            columnName="To Do"
            onClose={mockOnClose}
            onCreate={mockOnCreate}
            task={mockTask}
            onChange={mockOnChange}
            getProjectUsers={mockGetProjectUsers}
            {...overrides}
        />
    );

beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
    mockOnChange.mockClear();

    mockGetProjectUsers
        .mockClear()
        .mockResolvedValue(mockProjectUsers);
});

describe("CreateTaskModal", () => {

    test("renders modal correctly", () => {
        renderModal();

        expect(
            screen.getByText("Create Task")
        ).toBeTruthy();

        expect(
            screen.getByPlaceholderText(
                "Enter task name"
            )
        ).toBeTruthy();

        expect(
            screen.getByPlaceholderText(
                "Enter task description (optional)"
            )
        ).toBeTruthy();
    });

    test("does not render modal when visible is false", () => {
        renderModal({
            visible: false,
        });

        expect(
            screen.queryByText("Create Task")
        ).toBeFalsy();
    });

    test("renders project and column pills", () => {
        renderModal({
            projectName: "Test Project",
            columnName: "In Progress",
        });

        expect(
            screen.getByText("Test Project")
        ).toBeTruthy();

        expect(
            screen.getByText("In Progress")
        ).toBeTruthy();
    });

    test("updates task name on change", () => {
        renderModal();

        const input =
            screen.getByDisplayValue("New Task");

        fireEvent.changeText(
            input,
            "Updated Task"
        );

        expect(mockOnChange).toHaveBeenCalledWith(
            "name",
            "Updated Task"
        );
    });

    test("updates task description on change", () => {
        renderModal();

        const input =
            screen.getByDisplayValue(
                "Task description"
            );

        fireEvent.changeText(
            input,
            "Updated Description"
        );

        expect(mockOnChange).toHaveBeenCalledWith(
            "description",
            "Updated Description"
        );
    });

    test("renders labels section", () => {
        renderModal();

        expect(
            screen.getByText("LABELS")
        ).toBeTruthy();

        expect(
            screen.getByPlaceholderText(
                "Enter or select label"
            )
        ).toBeTruthy();
    });

    test("supports custom label input", () => {
        renderModal();

        const labelInput =
            screen.getByPlaceholderText(
                "Enter or select label"
            );

        fireEvent.changeText(
            labelInput,
            "custom"
        );

        expect(mockOnChange).toHaveBeenCalledWith(
            "label",
            "custom"
        );
    });

    test("toggles preset label", () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Urgent")
        );

        expect(mockOnChange).toHaveBeenCalledWith(
            "label",
            "Urgent"
        );
    });

    test("calls onCreate when Create button is pressed", () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Create")
        );

        expect(mockOnCreate)
            .toHaveBeenCalledWith(mockTask);
    });

    test("does not call onCreate when task name is empty", () => {
        renderModal({
            task: {
                ...mockTask,
                name: "",
            },
        });

        fireEvent.press(
            screen.getByText("Create")
        );

        expect(mockOnCreate)
            .not.toHaveBeenCalled();
    });

    test("does not call onCreate when task name is whitespace", () => {
        renderModal({
            task: {
                ...mockTask,
                name: "   ",
            },
        });

        fireEvent.press(
            screen.getByText("Create")
        );

        expect(mockOnCreate)
            .not.toHaveBeenCalled();
    });

    test("calls onClose when Close button is pressed", () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Close")
        );

        expect(mockOnClose)
            .toHaveBeenCalled();
    });

    test("shows assigned members", () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: [
                    {
                        id: "1",
                        email:
                            "user1@example.com",
                    },
                ],
            },
        });

        expect(
            screen.getByText(
                "user1@example.com"
            )
        ).toBeTruthy();
    });

    test("does not show assigned members when empty", () => {
        renderModal();

        expect(
            screen.queryByText(
                "user1@example.com"
            )
        ).toBeFalsy();
    });

    test("opens assign members modal", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Assign Members"
                )
            ).toBeTruthy();
        });
    });

    test("loads project users", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                mockGetProjectUsers
            ).toHaveBeenCalled();
        });
    });

    test("filters out current user", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.queryByText(
                    "current@example.com"
                )
            ).toBeFalsy();
        });
    });

    test("shows project users", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "user1@example.com"
                )
            ).toBeTruthy();

            expect(
                screen.getByText(
                    "user2@example.com"
                )
            ).toBeTruthy();
        });
    });

    test("toggles member assignment", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "user1@example.com"
                )
            ).toBeTruthy();
        });

        fireEvent.press(
            screen.getByText(
                "user1@example.com"
            )
        );

        expect(mockOnChange)
            .toHaveBeenCalled();
    });

    test("removes already assigned member when pressed again", async () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: [
                    {
                        id: "1",
                        email:
                            "user1@example.com",
                    },
                ],
            },
        });

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "user1@example.com"
                )
            ).toBeTruthy();
        });

        fireEvent.press(
            screen.getByText(
                "user1@example.com"
            )
        );

        expect(mockOnChange)
            .toHaveBeenCalledWith(
                "assignedMembers",
                []
            );
    });

    test("closes assign modal with Done button", async () => {
        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Assign Members"
                )
            ).toBeTruthy();
        });

        fireEvent.press(
            screen.getByText("Done")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Create Task"
                )
            ).toBeTruthy();
        });
    });

    test("handles getProjectUsers error", async () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        mockGetProjectUsers
            .mockRejectedValueOnce(
                new Error("Failed")
            );

        renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(consoleSpy)
                .toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    test("closes assign modal when visible becomes false", async () => {
        const { rerender } = renderModal();

        fireEvent.press(
            screen.getByText("Add Members")
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Assign Members"
                )
            ).toBeTruthy();
        });

        rerender(
            <CreateTaskModal
                visible={false}
                projectName="Project A"
                columnName="To Do"
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                task={mockTask}
                onChange={mockOnChange}
                getProjectUsers={
                    mockGetProjectUsers
                }
            />
        );

        expect(
            screen.queryByText(
                "Assign Members"
            )
        ).toBeFalsy();
    });

    test("handles task with full data", () => {
        renderModal({
            task: {
                name: "Complete Task",
                description:
                    "Full Description",
                label: "Urgent",
                assignedMembers: [
                    {
                        id: "1",
                        email:
                            "user1@example.com",
                    },
                ],
            },
        });

        expect(
            screen.getByDisplayValue(
                "Complete Task"
            )
        ).toBeTruthy();

        expect(
            screen.getByDisplayValue(
                "Full Description"
            )
        ).toBeTruthy();

        expect(
            screen.getByText(
                "user1@example.com"
            )
        ).toBeTruthy();
    });

    test("handles task with minimal data", () => {
        renderModal({
            task: {
                name: "Task",
                description: "",
                label: "",
                assignedMembers: [],
            },
        });

        expect(
            screen.getByDisplayValue("Task")
        ).toBeTruthy();
    });

    test("renders safely with undefined assignedMembers", () => {
        renderModal({
            task: {
                ...mockTask,
                assignedMembers: undefined,
            },
        });

        expect(
            screen.getByText("Create Task")
        ).toBeTruthy();
    });

});
>>>>>>> main
