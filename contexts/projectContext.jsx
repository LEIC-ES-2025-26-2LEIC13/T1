import { createContext, useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where, documentId } from "firebase/firestore"
import { db } from '../firebase/firebaseConfig';
import { useUser } from '../hooks/useUser';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([])
    const { user } = useUser()

    async function createProject(projectData) {
        const projectRef = await addDoc(collection(db, 'projects'), {
            ...projectData,
            createdBy: user.uid
        })

				// The user who created the project has it as one of his projects now
        await addDoc(collection(db, 'projectMemberships'), {
            projectId: projectRef.id,
            userId: user.uid
        })
    }

    async function deleteProject(id){
        await deleteDoc(doc(db, 'projects', id));
    }

    async function updateProject(id, updates) {
        await updateDoc(doc(db, 'projects', id), {...updates});
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
            // Just the projects' ids
            const projectIds = membershipSnap.docs.map((d) => d.data().projectId)

						// Necessary check because 'in' queries require a non-empty array
						if (projectIds.length === 0) {
								setProjects([]);
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
        });

      return () => unsub();
    }, [user?.uid]);

    return (
        <ProjectContext.Provider value={{ projects, setProjects, createProject, deleteProject, updateProject }}>
            {children}
        </ProjectContext.Provider>
    );
}