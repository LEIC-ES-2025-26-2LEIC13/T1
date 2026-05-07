import { useEffect, useState } from "react";
import AppModal from './AppModal';
import ModalHeader from "./modal/ModalHeader";
import ModalBody from "./modal/ModalBody";
import FormField from "./FormField";
import ModalActions from "./modal/ModalActions";

export default function EditColumnModal({ visible, onClose, onEdit, columnData}) {

    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (visible) {
            setEditName(''); // Always reset to empty string when modal opens
        }
    }, [visible]);

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
                    onChangeText={(value) => setEditName(value)}
                    value={editName}
                />

            </ModalBody>

            <ModalActions
                onCancel={onClose}
                primaryActionName="Edit"
                primaryActionIconName="pencil"
                onPrimaryActionPress={() => onEdit({ ...columnData, name: editName })}
                primaryActionDisabled={!editName.trim()} // .trim() to ignore whitespace
            />

        </AppModal>
    );
}
