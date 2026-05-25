import { createContext, useEffect, useState } from "react";
import { templateService } from "../api/templateService";
import { useAuth } from "../hooks/useAuth";
import { templateColumnService } from "../api/templateColumnService";

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
    const [templates, setTemplates] = useState([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const { isAdmin } = useAuth()

    const [columns, setColumns] = useState([])
    const [isLoadingColumns, setIsLoadingColumns] = useState(false)
    const [activeTemplateId, setActiveTemplateId] = useState('')

    // Subscribe to templates (only for admins)
    useEffect(() => {
        if (!isAdmin) {
            setTemplates([]);
            return
        }

        setIsLoadingTemplates(true);
        const unsub = templateService.subscribeToAllTemplates((templatesToDisplay) => {
            setTemplates(templatesToDisplay);
            setIsLoadingTemplates(false);
        })

        return () => unsub()
    }, [isAdmin])

    // update template columns
    useEffect(() => {
        if(!activeTemplateId){
            setColumns([])
            return
        }

        setIsLoadingColumns(true)
        const unsub = templateColumnService.subscribeToTemplateColumns(activeTemplateId, (columnsToDisplay) =>{
            setColumns(columnsToDisplay)
            setIsLoadingColumns(false)
        })

        return () => unsub()
    }, [activeTemplateId])

    
    
    async function createTemplate(templateData) {
        if (!isAdmin) {
            throw new Error("Only administrators can create templates");
        }
        await templateService.createTemplate(templateData)
    }

    async function updateTemplate(templateId, updates) {
        if (!isAdmin) {
            throw new Error("Only administrators can update templates");
        }
        await templateService.updateTemplate(templateId, updates)
    }

    async function deleteTemplate(templateId) {
        if (!isAdmin) {
            throw new Error("Only administrators can delete templates");
        }
        await templateService.deleteTemplate(templateId)
    }

    async function reorderTemplates(reorderedTemplates) {
        if (!isAdmin) {
            throw new Error("Only administrators can reorder templates");
        }
        await templateService.reorderTemplates(reorderedTemplates)
    }

    async function createColumn(columnData){
        await templateColumnService.createColumn(activeTemplateId, columnData)
    }

    async function deleteColumn(columnId){
        await templateColumnService.deleteColumn(activeTemplateId, columnId)
    }

    async function updateColumn(columnId, updates){
        await templateColumnService.updateColumn(activeTemplateId, columnId, updates)
    }
    

    return (
        <TemplateContext.Provider value={{
            templates,
            isLoadingTemplates,
            setTemplates,
            createTemplate,
            deleteTemplate,
            updateTemplate,
            reorderTemplates,

            columns,
            isLoadingColumns,
            createColumn,
            deleteColumn,
            updateColumn,
            setActiveTemplateId
        }}>
            {children}
        </TemplateContext.Provider>
    );
}
