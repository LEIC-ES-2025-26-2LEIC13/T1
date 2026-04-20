import { createContext, useState, useEffect} from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from '../firebase/firebaseConfig';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);

    async function createProject(projectData) {
        await addDoc(collection(db, 'projects'), {
            ...projectData,
        });
    }

    async function deleteProject(id){
        await deleteDoc(doc(db, 'projects', id));
    }

    async function updateProject(id, updates) {
        await updateDoc(doc(db, 'projects', id), {...updates});
    }

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projects);
        });
        return () => unsub();
    }, []);


    return (
        <ProjectContext.Provider value={{ projects, setProjects, createProject, deleteProject, updateProject }}>
            {children}
        </ProjectContext.Provider>
    );
}