# Sprint 3 Documentation

## Project Reordering

The project tab now supports drag-and-drop reordering, using the same interaction style as columns and tasks.

### Implementation

* Project order is stored per user inside `userProjects`, so each collaborator can keep a personal project order.
* Projects are read with `orderBy('order', 'asc')` to keep the list sorted by the saved order field.
* Reordering updates only the affected `userProjects` documents by writing the new `order` values in a batch.
* When a project is created, it receives the next available order value for that user, starting at `0`.

### Result

This keeps the project list stable, collaborative, and customizable without changing the shared project data itself.