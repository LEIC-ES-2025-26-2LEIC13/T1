import { useContext } from "react";
import { ColumnContext } from "../contexts/columnContext";

export default function useColumn() {
    const context = useContext(ColumnContext);

    if (!context) {
        throw new Error("useColumn must be used within a ColumnProvider");
    }

    return context;
}