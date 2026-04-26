import { createContext, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../hooks/useUser";

export const ProjectContext = createContext();

function normalizeProjectData({ title, description }) {
	return {
		title: title?.trim() ?? '',
		description: description?.trim() ?? '',
	}
}

function validateProjectTitle({ title }) {
	if (!title) {
		throw new Error('Please enter a project title')
	}
}

function normalizeProjectUpdates( { title, description }) {

  if (title !== undefined) {
	title = (title ?? '').trim();
	if (!title) throw new Error('Project title cannot be empty');
  }

  if (description !== undefined) {
	description = (description ?? '').trim();
  }

  return { title, description };
}

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]) // user projects
	const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const { user } = useUser()

    async function createProject(projectData) {
        const normalizedProjectData = normalizeProjectData(projectData)
		validateProjectTitle(normalizedProjectData)

        const projectRef = await addDoc(collection(db, 'projects'), {
            ...normalizedProjectData,
            createdBy: user.uid
        })

        // Create a document in a subcolletion 'users' inside the respective project document
        await addDoc(collection(projectRef, 'users'), {
            userId: user.uid,
            email: user.email // possible (from Auth context)
        })

        const userRef = doc(db, 'users', user.uid)

        // Create a document in a subcolletion 'projects' inside the respective user document
        await addDoc(collection(userRef, 'projects'), { 
            projectId: projectRef.id,
            title: normalizedProjectData.title,
            description: normalizedProjectData.description
        })
	}

    async function updateProject(id, updates) {
        const { title, description } = normalizeProjectUpdates(updates)
		if (!title && !description) {
			return // no updates
		}
		
        const dataToUpdate = {}
        if (title !== undefined) dataToUpdate.title = title
        if (description !== undefined) dataToUpdate.description = description
        
		await updateDoc(doc(db, 'projects', id), dataToUpdate)
    }
		
    useEffect(() => {
        if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
            setProjects([]);
            return;
        }

        const userRef = doc(db, 'users', user.uid)
        // Gets projects in which the current user is envolved
        const userProjects = query(
            collection(userRef, 'projects'),
        )

        const unsub = onSnapshot(userProjects, async (userProjectsSnap) => {
            setIsLoadingProjects(true)
            
            const projectsToDisplay = userProjectsSnap.docs.map(doc => ({
                id: doc.data().projectId, // true project ID 
                ...doc.data(),
            }));
            
            setProjects(projectsToDisplay)
            setIsLoadingProjects(false)
        });

      return () => unsub();
    }, [user?.uid]);

    async function deleteProject(id){
		await deleteDoc(doc(db, 'projects', id))
	}

    return (
        <ProjectContext.Provider value={{ projects, isLoadingProjects, setProjects, createProject, deleteProject, updateProject }}>
            {children}
        </ProjectContext.Provider>
    );
}
