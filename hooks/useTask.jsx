import { useContetx } from "react";
import { TaskContext } from "../contexts/taskContext";

export default function useTask() {
    const context = useContetx(TaskContext);

    if (!context) {
        throw new Error("useTask must be used within a TaskProvider");
    }

    return context;
}