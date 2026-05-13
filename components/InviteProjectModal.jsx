import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import ModalActions from './modal/ModalActions';
import Pill from './Pill';

export default function InviteProjectModal({
    visible,
    value,
    onChangeText,
    onClose,
    onInvite,
    projectName,
}) {

    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading="Invite Member"
                iconName="account-plus"
                onClose={onClose}  
            />

            <ModalBody>

                <Pill
                    projectName={projectName}
                    customStyle={ {marginBottom: 15 } }
                />

                <FormField
                    testID="invite-email-input"
                    labelName="EMAIL ADDRESS"
                    placeholder="Enter user email"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="email-outline"
                />

            </ModalBody>

            <ModalActions
                onCancel={onClose}
                primaryActionName="Send Invite"
                primaryActionIconName="send"
                onPrimaryActionPress={onInvite}
                primaryActionDisabled={!value.trim()} // .trim() to ignore whitespace
            />
        </AppModal>
    );
}
