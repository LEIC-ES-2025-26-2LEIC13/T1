import React from 'react'
import { StyleSheet, View, useColorScheme } from 'react-native'
import AppModal from './AppModal'
import ModalHeader from './modal/ModalHeader'
import FormField from './FormField'
import ModalBody from './modal/ModalBody'
import PillsContainer from './PillsContainer'
import Pill from './Pill'
import {LABELS} from '../constants/Labels'
import ModalActions from './modal/ModalActions'
import {LabelColors, Colors } from '../constants/Colors'
import AnimatedPressable from './AnimatedPressable'
import ThemedText from './ThemedText'
import ThemedIcon from './ThemedIcon'
import Spacer from './Spacer'
import ThemedView from './ThemedView'
import {taskService} from '../api/taskService'

export default function TaskModal({
    visible,
    task,
    projectName,
    columnName,
    onClose,
    deleteTask,
    projectId,
    columns,        
    columnId,       
    onTaskMoved, 
}) {
    
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const labelIcon = LABELS.find(label => label.name === task?.label)?.icon
    const labelColor = LabelColors[task?.label] ?? LabelColors.default

    const currentIndex = columns?.findIndex(c => c.id === columnId) ?? -1
    const prevColumn = currentIndex > 0 ? columns[currentIndex - 1] : null
    const nextColumn = currentIndex < (columns?.length - 1) ? columns[currentIndex + 1] : null

    const handleMove = async (targetColumn) => {
        console.log(projectId, task, columnId, targetColumn)
        await taskService.moveTaskToColumn(projectId, task, columnId, targetColumn)
        onTaskMoved?.()  // close modal after move
    }

    return (
        <AppModal visible={visible} onClose={onClose}>
            <ModalHeader
                heading="Task Details"
                iconName="checkbox-outline"
                onClose={onClose}
            />
            <ThemedView style={styles.columnNav}>
                {prevColumn ? (
                    <AnimatedPressable
                        style={styles.moveButton}
                        onPress={() => handleMove(prevColumn)}
                    >
                        <ThemedIcon name="arrow-left" size={14} />
                        <ThemedText
                            style={styles.moveButtonText}
                            numberOfLines={1}
                        >
                            {prevColumn.name}
                        </ThemedText>
                    </AnimatedPressable>
                ) : (
                    <ThemedView />
                )}

                {nextColumn ? (
                    <AnimatedPressable
                        style={styles.moveButton}
                        onPress={() => handleMove(nextColumn)}
                    >
                        <ThemedText
                            style={styles.moveButtonText}
                            numberOfLines={1}
                        >
                            {nextColumn.name}
                        </ThemedText>
                        <ThemedIcon name="arrow-right" size={14} />
                    </AnimatedPressable>
                ) : (
                    <ThemedView />
                )}
            </ThemedView>


            <ModalBody>
                <PillsContainer style={{ marginBottom: 15 }}>
                    <Pill projectName={projectName} />
                    <Pill columnName={columnName} />
                    {task?.label && (
                        <Pill
                            name={task.label}
                            iconName={labelIcon}
                            customStyle={{ backgroundColor: labelColor + '50' }}
                        />
                    )}
                </PillsContainer>

                <Spacer height={10} />

                <FormField labelName="TASK NAME" value={task?.name} readOnly />
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
                        task?.assignedMembers?.length > 0
                            ? task.assignedMembers.map(m => m.email).join(', ')
                            : 'No one'
                    }
                    readOnly
                />
            </ModalBody>
            <ModalActions
                onCancel={onClose}
                primaryActionName="Finish Task"
                primaryActionIconName="check"
                onPrimaryActionPress={() => deleteTask(task)}
            />
        </AppModal>
    )
}

const styles = StyleSheet.create({
    columnNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    moveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        maxWidth: '45%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    moveButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
})