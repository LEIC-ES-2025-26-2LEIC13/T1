import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import FormField from './FormField';
import ModalBody from './modal/ModalBody';
import ModalActions from './modal/ModalActions';

export default function CreateProjectModal({
    visible,
    onClose,
    onCreate,
    project,
    onChange,
}) {

    return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="New Project"
                iconName="folder-open-outline"
                onClose={onClose}
            />

            <ModalBody>
                <FormField
                    labelName="PROJECT TITLE"
                    placeholder="Enter project title"
                    value={project.title}
                    onChangeText={(value) => onChange('title', value)}
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="Enter project description (optional)"
                    value={project.description}
                    onChangeText={(value) => onChange('description', value)}
                />
            </ModalBody>


            <ModalActions
                onCancel={onClose}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryAction={() => onCreate(project)}
            />

        </AppModal>
    );
}
