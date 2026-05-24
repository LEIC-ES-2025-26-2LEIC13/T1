import { createContext, useEffect, useState } from "react";
import { templateService } from "../api/templateService";
import { useAuth } from "../hooks/useAuth";

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
    const [templates, setTemplates] = useState([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const { user, isAdmin } = useAuth()

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

    return (
        <TemplateContext.Provider value={{
            templates,
            isLoadingTemplates,
            setTemplates,
            createTemplate,
            deleteTemplate,
            updateTemplate
        }}>
            {children}
        </TemplateContext.Provider>
    );
}
