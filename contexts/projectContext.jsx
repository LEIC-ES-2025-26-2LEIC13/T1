import { createContext, useEffect, useState } from "react";
import { projectService } from "../api/projectService";
import { useAuth } from "../hooks/useAuth";

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]) // user projects
	const [isLoadingProjects, setIsLoadingProjects] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        if (!user?.uid) {
            setProjects([]);
            return
        }
        setIsLoadingProjects(true);
        const unsub = projectService.subscribeToUserProjects(user.uid, (projectsToDisplay) => {
            setProjects(projectsToDisplay);
            setIsLoadingProjects(false);
        })

      return () => unsub()
    }, [user?.uid])


    async function createProject(projectData) {
        await projectService.createProject(user.uid, user.email, projectData)
	}


    async function updateProject(projectId, updates) {
        await projectService.updateProject(projectId, updates)
    }


    async function deleteProject(projectId){
		await projectService.deleteProject(projectId)
	}

    async function kickMember(projectId, memberId) {
        await projectService.kickMember(projectId, memberId);
    }

    async function reorderProjects(reorderedProjects) {
        await projectService.reorderUserProjects(user.uid, reorderedProjects)
    }

    return (
        <ProjectContext.Provider value={{ projects, isLoadingProjects, setProjects, createProject, deleteProject, updateProject, kickMember, reorderProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}
