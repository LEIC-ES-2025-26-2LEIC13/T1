# Sprint 1
## Database Modelling and Integration
To integrate our app with a database, in this case, we had to redesign the database model, from a more SQL centric approach to a NoSQL approach (Firestore is inherently NoSQL so the first idea didn't make any sense).
The final model is the follwing:
````
├─ users                (collection)
│  └─ {userId}          (user document)
│     ├─ email
│     ├─ projects       (subcolletion)
│     │  └─ {projectId} (subcolletion document)
│     │     ├─ projectId
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
      └─ projectUsers        (subcollection)
         └─ {userId}         (subcollection document)
            ├─ userId
            └─ email
````

### Defect Log, Tracking and Verification

#### Scope
- Files inside the contexts folder: `contexts/inviteContext.jsx` and `contexts/projectContext.jsx`.

#### InviteContext and ProjectContext

##### Fixes / Improvements Implemented in Code
- Realtime invite synchronization is implemented through `onSnapshot` on the user invite subcollection.
- Duplicate invite prevention is implemented via query filters (where) on `receiverId` and `projectId` before creating a new invite.
- User-already-in-project validation is implemented before creating an invite (inviting a user that already is inside the project wouldn't make a lot of sense).

##### Verification Status
Tests were created for a previous version of the code. Currently a refactor is needed.

## UI improvements
The UI was improved during this sprint: modals, screens, layout.


## Defects / Further Improvements
1. Create "Classes" to better structure data that is sent/recieved to/from Firestore
2. Create high level functions to abstract repeated behaviour when interacting with database
3. Improve icon positioning and layout (inside the emulator was good but when testing on a real device those problems were identified)
4. Improve the color palette file `Colors.js` to create a more even coloring layout troughout the app without magic constants (colors only related to a certain file)
5. Need for stricter validation on text input: length bounds, invalid characters, duplicate naming policy.
6. Refactor logic to delete projects, currently incorrect
7. Partial writes risk (if the first one occurs and the second one fails, there will be missing data in the database), verify need for transaction