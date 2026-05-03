import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import ModalActions from './modal/ModalActions';
import Pill from './modal/Pill';

export default function InviteProjectModal({
    visible,
    value,
    onChangeText,
    onClose,
    onInvite,
    projectName,
}) {

    return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="Invite Member"
                iconName="account-plus"
                onClose={onClose}  
            />

            <ModalBody>

                <Pill
                    projectName={projectName}
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
            />
        </AppModal>
    );
}
