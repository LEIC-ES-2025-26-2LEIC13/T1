import React from 'react';
import { View, ScrollView } from 'react-native';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import Pill from './Pill';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import PillsContainer from './PillsContainer';
import ModalActions from './modal/ModalActions';
import { LABELS } from '../constants/Labels';
import { LabelColors } from '../constants/Colors';
import AssignMembersSection from './AssignMembersSection';


export default function CreateTaskModal({
    visible,
    projectName,
    columnName,
    onClose,
    onCreate,
    task,
    onChange,
    getProjectUsers,
    template = false
}) {
    const isPreset = LABELS.some(label => label.name === task.label)

    const labels = (
        <PillsContainer style={{ marginBottom: 15 }}>
            {LABELS.map((label) => {
                const isSelected = (task.label === label.name)
                const labelColor = LabelColors[label.name] || LabelColors.default;

                return (
                    <Pill
                        key={label.name}
                        name={label.name}
                        iconName={label.icon}
                        pressable
                        onPress={() => onChange('label', isSelected ? '' : label.name)}
                        customStyle={isSelected && { backgroundColor: `${labelColor}50` }}
                    />
                );
            })}
        </PillsContainer>
    )

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

                                {!template && (
                                    <FormField
                                        labelName="LABELS"
                                        placeholder="Enter or select label"
                                        value={isPreset ? "" : task.label}
                                        onChangeText={(text) => onChange('label', text)}
                                    />
                                )}
                                
                                {!template && labels}

                                {!template && (
                                    <AssignMembersSection
                                        assignedMembers={task.assignedMembers}
                                        onAssignedMembersChange={(members) => onChange('assignedMembers', members)}
                                        getProjectUsers={getProjectUsers}
                                        visible={visible}
                                    />
                                )}

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