import { createContext, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { projectService } from "../api/projectService";

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]) // user projects
	const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const { user } = useUser()

    useEffect(() => {
        if (!user?.uid) { // TODO: sometimes user is null when the app opens with cached login session open
            setProjects([]);
            return
        }

        setIsLoadingProjects(true);
        const unsub = projectService.subscribeToUserProjects(user.uid, (projectsToDisplay) => {
            setProjects(projectsToDisplay);
            setIsLoadingProjects(false);
        });

      return () => unsub();
    }, [user?.uid]);


    async function createProject(projectData) {
        await projectService.createProject(user.uid, user.email, projectData)
	}


    async function updateProject(id, updates) {
        await projectService.updateProject(id, updates)
    }


    async function deleteProject(id){
		await projectService.deleteProject(id)
	}

    return (
        <ProjectContext.Provider value={{ projects, isLoadingProjects, setProjects, createProject, deleteProject, updateProject }}>
            {children}
        </ProjectContext.Provider>
    );
}
