import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import ModalActions from './modal/ModalActions';

export default function CreateColumnModal({
    visible,
    onClose,
    onCreate,
    onChange,
    columnData,
}) {

    return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="New Column"
                iconName="table-column"
                onClose={onClose}
            />

            <ModalBody>

                <FormField
                    labelName="COLUMN NAME"
                    placeholder="Enter column name"
                    value={columnData.name}
                    onChangeText={(value) => onChange('name', value)}
                />

            </ModalBody>


            <ModalActions
                onCancel={onClose}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={() => onCreate(columnData)}
            />
        </AppModal>
    );
}
