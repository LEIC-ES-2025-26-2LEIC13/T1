import AppModal from "./AppModal";
import ModalHeader from "./modal/ModalHeader";
import ModalBody from "./modal/ModalBody";
import FormField from "./FormField";
import ModalActions from "./modal/ModalActions";

export default function CreateSuggestionModal({
    visible,
    onClose,
    onCreate,
    onChange,
    suggestion,
}) {

    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading="Make a suggestion"
                iconName="lightbulb-on-outline"
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="SUGGESTION DESCRIPTION"
                    placeholder="Enter suggestion description"
                    value={suggestion.description}
                    onChangeText={(value) => onChange('description', value)}
                />

            </ModalBody>


            <ModalActions
                onCancel={onClose}
                primaryActionName="Submit"
                primaryActionIconName="send"
                onPrimaryActionPress={() => onCreate(suggestion)}
                primaryActionDisabled={!suggestion.description.trim()}
            />
        </AppModal>
    );
}