import { createContext, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where, documentId } from "firebase/firestore"
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

        // The user who created the project has it as one of his projects now
        await addDoc(collection(db, 'projectMemberships'), {
            projectId: projectRef.id,
            userId: user.uid
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

        // Gets docs relative to the current user
        const membershipsQuery = query(
            collection(db, 'projectMemberships'),
            where('userId', '==', user.uid)
        )

        const unsub = onSnapshot(membershipsQuery, async (membershipSnap) => {
            setIsLoadingProjects(true)

            // Just the projects' ids
            const projectIds = membershipSnap.docs.map((d) => d.data().projectId)

            // Necessary check because 'in' queries require a non-empty array
            if (projectIds.length === 0) {
                setProjects([]);
                setIsLoadingProjects(false)
                return;
            }

            // Get entire documents from the projects collection
            const userProjects = await getDocs(
                query(
                    collection(db, 'projects'),
                    where(documentId(), 'in', projectIds) // warning: Firestore has a 'in' max list size
                ))

            // Format accordingly
            const projectsToDisplay = userProjects.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsToDisplay);
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
