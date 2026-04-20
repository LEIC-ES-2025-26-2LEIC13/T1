import { createContext, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

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

	async function createProject(projectData) {
		const normalizedProjectData = normalizeProjectPayload(projectData)
		validateProjectPayload(normalizedProjectData)

		await addDoc(collection(db, 'projects'), {
			...normalizedProjectData,
		});
	}

	async function deleteProject(id){
		await deleteDoc(doc(db, 'projects', id))
	}

	async function updateProject(id, updates) {
		const normalizedUpdates = normalizeProjectUpdates(updates)
		if (Object.keys(normalizedUpdates).length === 0) {
			return
		}
		await updateDoc(doc(db, 'projects', id), {...normalizedUpdates})
	}

	useEffect(() => {
		const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
			const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setProjects(projects)
		});
		return () => unsub()
	}, []);

	return (
		<ProjectContext.Provider value={{ projects, setProjects, createProject, deleteProject, updateProject}}>
			{children}
		</ProjectContext.Provider>
	);
}
