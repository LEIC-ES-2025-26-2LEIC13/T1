import { COLLECTIONS, SUBCOLLECTIONS } from "../constants/Collections";
import { collection, doc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

// Allows to centralize the logic of building document references and collection references, minimizing repetition
export const pathHelper = {
    // admin related

    admin: (userId) => doc(db, COLLECTIONS.ADMIN, userId),

    // User Related
    user: (userId) => doc(db, COLLECTIONS.USERS, userId),

    userInvites: (userId) => collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_INVITES),

    userInvite: (userId, inviteId) => doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_INVITES, inviteId),
        
    userProjects: (userId) => collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_PROJECTS),

    userProject: (userId, projectId) => doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_PROJECTS, projectId),

    userTask: (userId, taskId) => doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_TASKS, taskId),

    userTasks: (userId) => collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.USER_TASKS),

    // Project Related

    project: (projectId) => doc(db, COLLECTIONS.PROJECTS, projectId),

    projectUser: (projectId, userId) => doc(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_USERS, userId),

    projectUsers: (projectId) => collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_USERS),

    projectColumns: (projectId) =>
        collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS),

    projectColumn: (projectId, columnId) =>
        doc(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.PROJECT_COLUMNS, columnId),

    columnTasks: (projectId, columnId) => 
        collection(db, COLLECTIONS.PROJECTS, projectId, 
            SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS),

    columnTask: (projectId, columnId, taskId) =>
        doc(db, COLLECTIONS.PROJECTS, projectId, 
            SUBCOLLECTIONS.PROJECT_COLUMNS, columnId, SUBCOLLECTIONS.COLUMN_TASKS, taskId),

    // Template Related

    template: (templateId) => doc(db, COLLECTIONS.TEMPLATES, templateId),

    templateColumns: (templateId) =>
        collection(db, COLLECTIONS.TEMPLATES, templateId, SUBCOLLECTIONS.TEMPLATE_COLUMNS),

    templateColumn: (templateId, columnId) =>
        doc(db, COLLECTIONS.TEMPLATES, templateId, SUBCOLLECTIONS.TEMPLATE_COLUMNS, columnId),

    templateColumnTasks: (templateId, columnId) =>
        collection(db, COLLECTIONS.TEMPLATES, templateId,
            SUBCOLLECTIONS.TEMPLATE_COLUMNS, columnId, SUBCOLLECTIONS.TEMPLATE_COLUMN_TASKS),

    templateColumnTask: (templateId, columnId, taskId) =>
        doc(db, COLLECTIONS.TEMPLATES, templateId,
            SUBCOLLECTIONS.TEMPLATE_COLUMNS, columnId, SUBCOLLECTIONS.TEMPLATE_COLUMN_TASKS, taskId)
}