# Improvements for Sprint 2

## Authentication

One problem we encountered on our code was the fact that each time we wanted to fetch data from the database (projects, invites, tasks, etc.) there was a need to check for the user.uid of the user, especially in the case of a user that is already logged in and doesn't have to insert credentials again.
Due to the fact that, upon mount, the useEffect responsible for fetching the data from the database was being called before the user.uid was set.
For example, inside projectContext, that was exactly the case: projects are fetched based on the user.uid and as it was immediatelly called, that value was still null as the AsyncStorage didn't have time to update it.
Even when the user was not logged in, without the conditional check, the app also crashed, confirming what was expected.

### Solution

In this case, a solution was not implemented simply because it would complicate even more the Route Navigation inside `app/_layout.tsx`. We would need to create an extra layer of security that would simply difficult the understanding and also take too much effort to implement. For now, we will keep as it is.

## New database organization

* Separate database logic into a new module (`api/` directory), to better organize the code and reduce the amount of code in the contexts.
* Now there are 3 layers of database interaction:
  * **Service Layer** (`api/`): provides high level functions to interact with the database.
  * **State Layer** (`contexts/`): manages the state of the app and provides caching across the whole app.
  * **Consumption Layer** (`hooks/`): provides custom hooks to consume the state and functions provided by the contexts.

## Batch operations for project deletions

As atomicity was desired for the application (collaborative), batch operations were implemented for project deletions. A single project deletion requires the deletion of multiple nested documents, all document references are collected, stored in an array `refsToDelete`, and then, using the `batchDelete` helper function, deleted in batches of 450 (to keep under the limit of 500 operations per batch commit imposed by firebase). This guarantees atomicity and also allows for the deletion of projects with a large number of nested documents without hitting the operation limit.

## Updated database structure

Since the database now includes projectColumns as a subcollection that contains columns of a project and those columns now have a subcollection of tasks, the database structure has been updated to reflect this change:

```
/
├─ users                (collection)
│  └─ {userId}          (user document)
│     ├─ email
│     ├─ userProjects       (subcolletion)
│     │  └─ {projectId} (subcolletion document)
│     │     ├─ title
│     │     └─ description
│     └─ userInvites        (subcollection)
│        └─ {inviteId}  (subcolletion document)
│           ├─ createdAt
│           ├─ projectId
│           ├─ projectName
│           ├─ senderId
│           └─ senderEmail
│
└─ projects             (collection)
   └─ {projectId}       (project document)
      ├─ title
      ├─ description
      ├─ createdBy
      ├─ projectUsers        (subcollection)
      │  └─ {userId}         (subcollection document)
      │     └─ email
      ├─ columnCount
      │
      └─ projectColumns
          └─ {columnId}   (subcollection document)
              ├─ name
              ├─ order
              └─ columnTasks
                  └─ {taskId}   (subcollection document)
                      ├─ name
                      ├─ description
                      └─ label
```

## New api services

For that same reason, a new api service was created: `columnsService`, that is responsible for all the interactions with the database for creating, updating and deleting column related data. Also, `tasksService.js` was updated to reflect the database overhaul. Contexts and services were created for that same reason.

## UI Refactor

* A major UI refactor was made for the entire project, with special impact on the following aspects:
  * Code modularity: new components were created inside the `components/` directory in order to promote code reuse and separation of concerns. Some examples are the components in `components/modal/` directory, that are now used for all the modals in the app, `LoadingScreen.jsx`, `FormField.jsx`, etc.
  * Use of consistent color pallette (from `constants/Colors.js`).
  * Refactor of the styling code: uniformization of styles across the app, specially in the files `project.jsx`, `project_tab.jsx` and `column.jsx` that were the ones with more styling code.
  * New Login/Register/Intro UI design.
  * New icons from `@expo/vector-icons/MaterialCommunityIcons` library.
  * Custom alerts: instead of using the default `Alert` from react native, a custom `ThemedAlert` component was created, corresponding to the app theme.
  * New empty state for FlatList components, with a message and an icon.
  * Bug fixes related to the UI.
  * Inside `project.jsx` an horizontal FlatList was introduced to allow column swiping, facilitating the navigation inside each project (much appreciated for mobile users). Also new modals and components were created to allow users to create, edit and delete columns.

## Implement database path helper

### NOT YET IMPLEMENTED (but will be done in this sprint)

# Implement database path helper

To avoid hardcoding database paths throughout the codebase, `pathHelper.js` was implemented to generate the correct paths for different operations. This not only reduces the chances of errors due to typos but also centralizes the logic for path generation, making it easier to maintain and update in the future if the database structure changes. Logic is now consistent and self contained inside the helper, improving code readability and maintainability.

## Acceptance tests

* There is a new subdirectory `subflows/` inside the [acceptance tests directory](../__tests__/acceptance_tests/) that includes reusable test flows that can be used to compose other tests.
* These subflows are used in the main tests as follows:

```yaml
- runFlow:
    file: subflows/login.yaml # for example, login subflow
    env:
        EMAIL: ${SENDER_EMAIL}
        PASSWORD: ${SENDER_PASSWORD}
```

* ... where:
  * `file` is the path to the subflow.
  * `env` allows passing environment variables to the subflow. In this case, `SENDER_EMAIL` and `SENDER_PASSWORD` are environment variables defined within the main test itself.

* Inside the subflow, the environment variables are used with the same `${VAR_NAME}` syntax.

## Icons

* Icons used in the project are now from the `@expo/vector-icons/MaterialCommunityIcons` library. Icon collection [here](https://icons.expo.fyi/Index) with the filter set to "MaterialCommunityIcons".
