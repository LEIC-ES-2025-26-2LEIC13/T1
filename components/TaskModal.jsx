import React from 'react';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import FormField from './FormField';
import ModalBody from './modal/ModalBody';
import PillsContainer from './modal/PillsContainer';
import Pill from './modal/Pill';
import { LABELS } from '../constants/Labels';
import ModalActions from './modal/ModalActions';

export default function TaskModal({ visible, task, projectName, columnName, onClose, deleteTask }) {

    // The corresponding icon for the task label
    const labelIcon = LABELS.find(label => label.name === task?.label)?.icon;

    return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="Task Details"
                iconName="checkbox-outline"
                onClose={onClose}
            />

            <ModalBody>

                <PillsContainer>
                    <Pill projectName={projectName}/>
                    <Pill columnName={columnName}/>
                    {
                        task?.label && <Pill name={task.label} iconName={labelIcon}/>
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
