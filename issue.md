# User story


## Statement

**As a** LEIC student,
**I want to** delete tasks from a project board,
**So that** I can remove tasks that were created by mistake or are no longer necessary.

## Business Value

* Allows users to quickly remove wrong or unnecessary tasks.
* Keeps project boards clean and focused on relevant work.
* Reduces confusion caused by outdated tasks that should no longer be tracked.

## Assumptions / Dependencies

* The user must be authenticated.
* The user must be inside an existing project board.
* At least one task must already exist in the project board.
* Any user that belongs to the project can delete tasks.

## Normal Scenario

* User opens the app.
* User is already authenticated in the system or logs in successfully.
* User navigates to a project board where tasks are listed.
* User locates a task that was created by mistake or is no longer necessary.
* User clicks on the dotted menu (three vertical dots) next to the task and selects "Delete Task" from the dropdown options.
* The system displays a confirmation dialog with the task name and a warning about permanent deletion.
* User confirms the deletion.
* The task is permanently removed from the project board.
* The updated task list is shown without the deleted task.

## Acceptance Test

### Scenario: User successfully deletes a task

`Given that` the user is logged in in the app
`And` a project board named "Programming Project" exists in the workspace
`And` the board contains a task named "Task A"
`When` the user navigates to that board and clicks the dotted menu (three vertical dots) next to "Task A" and selects "Delete Task"
`And` a confirmation dialog appears with a warning message
`And` he confirms the deletion
`Then` the task "Task A" is permanently removed from the project board
`And` the task no longer appears in the board task list.
