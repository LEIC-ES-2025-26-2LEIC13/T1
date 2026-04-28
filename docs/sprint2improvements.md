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
  - **Service Layer** (`api/`): provides high level functions to interact with the database.
  - **State Layer** (`contexts/`): manages the state of the app and provides caching across the whole app.
  - **Consumption Layer** (`hooks/`): provides custom hooks to consume the state and functions provided by the contexts.

## Batch operations for project deletions
As atomicity was desired for the application (collaborative), batch operations were implemented for project deletions. A single project deletion requires the deletion of multiple nested documents, all document references are collected, stored in an array `refsToDelete`, and then, using the `batchDelete` helper function, deleted in batches of 450 (to keep under the limit of 500 operations per batch commit imposed by firebase). This guarantees atomicity and also allows for the deletion of projects with a large number of nested documents without hitting the operation limit.