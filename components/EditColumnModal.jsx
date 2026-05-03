import { useState } from "react";
import AppModal from './AppModal';
import ModalHeader from "./modal/ModalHeader";
import ModalBody from "./modal/ModalBody";
import FormField from "./FormField";
import ModalActions from "./modal/ModalActions";

export default function EditColumnModal({ visible, onClose, onEdit, columnData}) {

    const [editedColumn, setEditedColumn] = useState(columnData);


    const handleChange = (field, value) => {
        setEditedColumn((prev) => ({ ...prev, [field]: value }))
    };

     return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="Edit Column Name"
                iconName="table-column"
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="COLUMN TITLE"
                    placeholder="Enter new column title"
                    value={editedColumn.name}
                    onChangeText={(value) => handleChange('name', value)}
                />

            </ModalBody>

            <ModalActions
                onCancel={onClose}
                primaryActionName="Edit"
                primaryActionIconName="pencil"
                onPrimaryActionPress={() => onEdit(editedColumn)}
            />

        </AppModal>
    );
}
