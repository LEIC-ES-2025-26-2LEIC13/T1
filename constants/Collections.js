// Names used for collections and subcolletion in the Firestore database

export const COLLECTIONS = {
    USERS: 'users',
    PROJECTS: 'projects',
    TEMPLATES: 'templates',
    ADMIN: 'admin',
};

export const SUBCOLLECTIONS = {
    USER_INVITES: 'userInvites',
    USER_PROJECTS: 'userProjects',
    USER_TASKS: 'userTasks',
    PROJECT_USERS: 'projectUsers',
    //PROJECT_TASKS: 'projectTasks',
    PROJECT_COLUMNS: 'projectColumns',
    COLUMN_TASKS: 'columnTasks',
    TEMPLATE_COLUMNS: 'templateColumns',
    COLUMN_TEMPLATES: 'columnTemplates',
};