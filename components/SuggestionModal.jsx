import React from 'react'
import { StyleSheet } from 'react-native'
import AppModal from './AppModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'
import ModalActions from './modal/ModalActions'
import FormField from './FormField'
import Pill from './Pill'
import PillsContainer from './PillsContainer'
import Spacer from './Spacer'

export default function SuggestionModal({
    visible,
    suggestion,
    onClose,
    deleteSuggestion,
}) {
    if (!suggestion) return null;

    const handleDelete = async () => {
        try {
            if (deleteSuggestion) {
                await deleteSuggestion(suggestion.id);
                onClose();
            }
        } catch (error) {
            console.error('Error deleting suggestion:', error);
        }
    };

    return (
        <AppModal visible={visible} onClose={onClose}>
            <ModalHeader
                heading="Suggestion Details"
                iconName="lightbulb-on-outline"
                onClose={onClose}
            />

            <ModalBody>
                <PillsContainer style={styles.pillsContainer}>
                    {suggestion.projectName && (
                        <Pill name={suggestion.projectName} />
                    )}
                    {suggestion.templateName && (
                        <Pill name={suggestion.templateName} />
                    )}
                </PillsContainer>

                <Spacer height={10} />

                <FormField
                    labelName="SENT BY"
                    value={suggestion.userEmail || 'Unknown'}
                    readOnly
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="No description provided."
                    value={suggestion.description || ''}
                    multiline
                    readOnly
                />
            </ModalBody>

            <ModalActions
                onCancel={onClose}
                primaryActionName={"Delete"}
                primaryActionIconName={"trash-can-outline"}
                onPrimaryActionPress={ handleDelete }
            />
        </AppModal>
    )
}

const styles = StyleSheet.create({
    pillsContainer: {
        marginBottom: 15,
    },
})

