import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import Pill from './Pill';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import PillsContainer from './modal/PillsContainer';
import ModalActions from './modal/ModalActions';
import { LABELS } from '../constants/Labels';
import { LabelColors } from '../constants/Colors';


export default function CreateTaskModal({
    visible,
    projectName,
    columnName,
    onClose,
    onCreate,
    task,
    onChange,
}) {
    // Flag that indicates if the selected label is one of the presets from the array LABELS. Used to clear the custom label input.
    const isPreset = LABELS.some(label => label.name === task.label);

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
                        onPress={() => onChange('label', label.name)}
                        customStyle={isSelected && { backgroundColor: `${labelColor}50` }}
                    />
                );
            })}
        </PillsContainer>
    )

    return (
        <AppModal visible={visible} onClose={onClose}>

            <ModalHeader
                heading="Create Task"
                iconName="note-plus"
                onClose={onClose}
            />

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
                
                <FormField
                    labelName="LABELS"
                    placeholder="Enter or select label"
                    value={isPreset ? "" : task.label}
                    onChangeText={(text) => onChange('label', text)}
                />

                {labels}

            </ModalBody>

            <ModalActions
                onCancel={onClose}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={() => onCreate(task)}
                primaryActionDisabled={!task.name.trim()} // .trim() to ignore whitespace
                secondaryActionName="Close"
            />
        </AppModal>
    );
}
