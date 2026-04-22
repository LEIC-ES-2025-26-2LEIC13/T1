import { createContext, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig";
import { useUser } from "../hooks/useUser";

export const ProjectContext = createContext();

function normalizeProjectPayload(projectData = {}) {
	return {
		...projectData,
		title: projectData?.title?.trim() ?? '',
		description: projectData?.description?.trim() ?? '',
	}
}

function validateProjectPayload(projectData = {}) {
	if (!projectData.title) {
		throw new Error('Please enter a project title')
	}
}

function normalizeProjectUpdates(updates = {}) {
  const normalized = { ...updates };

  if (normalized.title !== undefined) {
	normalized.title = (normalized.title ?? '').trim();
	if (!normalized.title) throw new Error('Project title cannot be empty');
  }

  if (normalized.description !== undefined) {
	normalized.description = (normalized.description ?? '').trim();
  }

  return normalized;
}

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([])
	const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const { user } = useUser()

    async function createProject(projectData) {
        const normalizedProjectData = normalizeProjectPayload(projectData)
		validateProjectPayload(normalizedProjectData)

        const projectRef = await addDoc(collection(db, 'projects'), {
            ...normalizedProjectData,
            createdBy: user.uid
        })

        // Create a document in a subcolletion 'users' inside the respective project document
        await addDoc(collection(projectRef, 'users'), {
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
        const normalizedUpdates = normalizeProjectUpdates(updates)
		if (Object.keys(normalizedUpdates).length === 0) {
			return
		}
		await updateDoc(doc(db, 'projects', id), {...normalizedUpdates})
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
