import { useContext } from "react"
import { TemplateContext } from "../contexts/templateContext"

export function useTemplate() {
    const context = useContext(TemplateContext)

    if (!context) {
        throw new Error("useTemplate must be used within a TemplateProvider")
    }

    return context
}

