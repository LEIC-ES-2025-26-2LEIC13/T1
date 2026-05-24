import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import FormField from './FormField';
import ModalBody from './modal/ModalBody';
import ModalActions from './modal/ModalActions';

export default function CreateTemplateModal({
                                                visible,
                                                onClose,
                                                onCreate,
                                                project,
                                                onChange,
                                            }) {

    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading="New Template"
                iconName="copy-outline"
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="TEMPLATE TITLE"
                    placeholder="Enter template title"
                    value={project.title}
                    onChangeText={(value) => onChange('title', value)}
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="Enter template description (optional)"
                    value={project.description}
                    onChangeText={(value) => onChange('description', value)}
                    multiline
                />

            </ModalBody>

            <ModalActions
                testID="create-template-modal-actions"
                onCancel={onClose}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={() => onCreate(project)}
                primaryActionDisabled={!project.title.trim()}
            />

        </AppModal>
    );
}