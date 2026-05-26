# Sprint 3 Documentation

## Updated database structure

``` text
/
├─ users                      (collection)
│  └─ {userId}                (user document)
│     ├─ email
│     ├─ userProjects         (subcolletion)
│     │  └─ {projectId}       (subcolletion document)
│     │     ├─ title
│     │     └─ description
│     │
│     ├─ userInvites
│     │  └─ {inviteId}
│     │     ├─ createdAt
│     │     ├─ projectId
│     │     ├─ projectName
│     │     ├─ senderId
│     │     └─ senderEmail
│     │
│     └─ userTasks
│        └─ {taskId}
│           ├─ name
│           ├─ description
│           ├─ label
|           ├─ assignedMembers
|           ├─ projectId
│           ├─ projectName
|           ├─ columnId
│           ├─ columnName
│           └─ createdAt
│
├─ projects
|  └─ {projectId}
|     ├─ title
|     ├─ description
|     ├─ createdBy
|     ├─ columnCount
|     │
|     ├─ projectUsers
|     │  └─ {userId}
|     │     └─ email
|     │
|     └─ projectColumns
|         └─ {columnId}
|             ├─ name
|             ├─ order
|             ├─ createdAt
|             │
|             └─ columnTasks
|                 └─ {taskId}
|                     ├─ name
|                     ├─ description
|                     ├─ label
|                     ├─ assignedMembers
|                     ├─ order
|                     └─ createdAt
|
└─ templates
   └─ {templateId}
      ├─ title
      ├─ description
      ├─ columnCount
      │
      └─ templateColumns
          └─ {columnId}
			 ├─ name
 			 ├─ order
 			 │
 			 └─ templateColumnTasks
 			    └─ {taskId}
 			       ├─ name
			       ├─ description
				   ├─ hints
			       └─ order
```


## Google Sign-In Update

The login flow was updated so that authentication is now centered around Google Sign-In instead of the previous email/password entry point. The intro page now shows a Google sign-in button and triggers the authentication flow from there, keeping the entry experience simpler for the user.

The authentication layer was also adapted to support this change:

* `authService.js` now centralizes the Google login flow.
* The signed-in Firebase user is kept in the auth state through the existing subscription mechanism.
* After a successful sign-in, the user email is normalized before being stored in Firestore.

This change reduces onboarding friction and keeps account creation aligned with the identity provider that is already used by the app.

## Admin Verification

Another important change in this sprint was the introduction of explicit admin verification. Instead of treating every authenticated user the same, the app now checks whether the user has a document in the `admin` collection using their UID as the document id.

If that document exists, the user is considered an admin and the app routes them to the admin area. If it does not exist, the user is treated as a normal member and goes through the regular home flow.

This required updates in the authentication context and root navigation:

* `contexts/authContext.jsx` now stores the `isAdmin` state.
* The auth loading state only finishes after the admin check is resolved.
* `app/_layout.jsx` chooses between the admin stack and the regular stack based on that role.

## New Admin Area

The branch also introduced a first version of a dedicated admin interface. The admin area now has its own drawer and tab structure, separated from the regular user navigation.

The current structure is:

```text
/
├─ admin
│  └─ {userId}   (admin document used for verification)
└─ users
	└─ {userId}
		└─ email
```

The admin routes currently include:

* a main admin landing screen,
* a suggestions page,
* an admin settings page,
* an admin tab that reuses the existing template screen as a placeholder.

This is intentionally lightweight for now, but it establishes the route structure needed for admin-only functionality later on.

## Navigation Impact

The new role check changes the way the app boots after authentication:

* regular users are sent to the home drawer and project screens,
* admins are sent to the dedicated admin drawer,
* the app waits for the role lookup before finishing the initial loading state.

This prevents the UI from briefly showing the wrong navigation shell while the auth state is still being resolved.

## Summary

These two commits mainly reworked the authentication and navigation entry flow:

* Google Sign-In became the primary login path.
* Admin users are now identified through a dedicated Firestore collection.
* The app now switches between two different navigation structures depending on the user role.

The result is a cleaner entry point for regular users and a separate space for admin-only functionality.
## Project Reordering

The project tab now supports drag-and-drop reordering, using the same interaction style as columns and tasks.

### Implementation

* Project order is stored per user inside `userProjects`, so each collaborator can keep a personal project order.
* Projects are read with `orderBy('order', 'asc')` to keep the list sorted by the saved order field.
* Reordering updates only the affected `userProjects` documents by writing the new `order` values in a batch.
* When a project is created, it receives the next available order value for that user, starting at `0`.

### Result

This keeps the project list stable, collaborative, and customizable without changing the shared project data itself.
