import React from 'react';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import FormField from './FormField';
import ModalBody from './modal/ModalBody';
import PillsContainer from './PillsContainer';
import Pill from './Pill';
import { LABELS } from '../constants/Labels';
import ModalActions from './modal/ModalActions';
import { LabelColors } from '../constants/Colors';

export default function TaskModal({ visible, task, projectName, columnName, onClose, deleteTask }) {

    // The corresponding icon for the task label
    const labelIcon = LABELS.find(label => label.name === task?.label)?.icon
    const labelColor = LabelColors[task?.label] || LabelColors.default;

    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading="Task Details"
                iconName="checkbox-outline"
                onClose={onClose}
            />

            <ModalBody>

                <PillsContainer style={{ marginBottom: 15 }}>
                    <Pill projectName={projectName}/>
                    <Pill columnName={columnName}/>
                    {
                        task?.label && <Pill name={task.label} iconName={labelIcon} customStyle={{ backgroundColor: `${labelColor}50` }}/>
                    }
                </PillsContainer>

                <FormField
                    labelName="TASK NAME"
                    value={task?.name}
                    readOnly
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="No description provided."
                    value={task?.description}
                    multiline
                    readOnly
                />

                <FormField
                    labelName="ASSIGNED TO"
                    value={
                        task?.assignedMembers && task.assignedMembers.length > 0
                            ? task.assignedMembers.map(m => m.email).join(', ')
                            : "No one"
                    }
                    readOnly
                />

            </ModalBody>
                    
            <ModalActions
                onCancel={onClose}
                primaryActionName="Finish Task"
                primaryActionIconName="check"
                onPrimaryActionPress={() => deleteTask(task.id)}
            />
        </AppModal>
    );
}
