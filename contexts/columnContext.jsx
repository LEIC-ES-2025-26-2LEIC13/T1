import { createContext, useEffect, useState } from "react"
import { columnService } from "../api/columnService"

export const ColumnContext = createContext()

export const ColumnProvider = ({children}) => {
    const [columns, setColumns] = useState([])
    const [isLoadingColumns, setIsLoadingColumns] = useState(false)
    const [activeProjectId, setActiveProjectId] = useState('')

    // update project columns
    useEffect(() => {
        if(!activeProjectId){
            setColumns([])
            return
        }

        setIsLoadingColumns(true)
        const unsub = columnService.subscribeToProjectColumns(activeProjectId, (columnsToDisplay) =>{
            setColumns(columnsToDisplay)
            setIsLoadingColumns(false)
        })

        return () => unsub()
    }, [activeProjectId])

    async function createColumn(columnData){
        await columnService.createColumn(activeProjectId, columnData)
    }

    async function deleteColumn(columnId){
        await columnService.deleteColumn(activeProjectId, columnId)
    }

    async function updateColumn(columnId, updates){
        await columnService.updateColumn(activeProjectId, columnId, updates)
    }

    return (
        // Values shared to any component that access it through context calls
        <ColumnContext.Provider value = {{columns, createColumn, deleteColumn, activeProjectId, setActiveProjectId, updateColumn, isLoadingColumns}}>
            {children}
        </ColumnContext.Provider>
    )
}