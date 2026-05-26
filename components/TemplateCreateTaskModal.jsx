import React from 'react';
import { View, ScrollView } from 'react-native';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import Pill from './Pill';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import PillsContainer from './PillsContainer';
import ModalActions from './modal/ModalActions';

export default function TemplateCreateTaskModal({
    visible,
    projectName,
    columnName,
    onClose,
    onCreate,
    task,
    onChange,
    getProjectUsers,
}) {

    const handleCreateWrapper = async () => {
        await onCreate(task);
    };

    return (
        <>
            <AppModal visible={visible} onClose={onClose}>
                <>
                    <ModalHeader
                        heading="Create Task"
                        iconName="note-plus"
                        onClose={onClose}
                    />

                    <View style={{ maxHeight: 500 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <ModalBody>

                                <PillsContainer style={{ marginBottom: 15 }}>
                                    <Pill projectName={projectName}/>
                                    <Pill columnName={columnName}/>
                                </PillsContainer>

                                <FormField
                                    labelName="TASK NAME"
                                    placeholder="Enter task name"
                                    value={task.name}
                                    onChangeText={(value) => onChange('name', value)}
                                />

                                <FormField
                                    labelName="DESCRIPTION"
                                    placeholder="Enter task description (optional)"
                                    value={task.description}
                                    onChangeText={(value) => onChange('description', value)}
                                    multiline
                                />
                                
                            </ModalBody>
                        </ScrollView>
                    </View>

                    <ModalActions
                        testID="create-task-modal-actions"
                        onCancel={onClose}
                        primaryActionName="Create"
                        primaryActionIconName="plus"
                        onPrimaryActionPress={handleCreateWrapper}
                        primaryActionDisabled={!task.name.trim()}
                        secondaryActionName="Close"
                    />
                </>
            </AppModal>
        </>
    );
}