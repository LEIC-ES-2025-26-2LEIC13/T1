import AppModal from "./AppModal";
import ModalHeader from "./modal/ModalHeader";
import ModalBody from "./modal/ModalBody";
import FormField from "./FormField";
import ModalActions from "./modal/ModalActions";

export default function EditProjectModal({
    visible,
    onClose,
    project,
    onChange,
    onSave,
}) {
    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading={"Edit Project"}
                iconName={"folder-edit-outline"}
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="PROJECT TITLE"
                    placeholder="Enter project title"
                    value={project.title || ''}
                    onChangeText={(value) => onChange('title', value)}
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="Enter project description (optional)"
                    value={project.description || ''}
                    onChangeText={(value) => onChange('description', value)}
                    multiline
                />

            </ModalBody>

            <ModalActions
                testID="edit-project-modal-actions"
                onCancel={onClose}
                primaryActionName="Save"
                primaryActionIconName="content-save-outline"
                onPrimaryActionPress={() => {onSave(project)}}
            />
        </AppModal>
    )
}