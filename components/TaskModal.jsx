import React, {useState, useCallback} from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import AppModal from './AppModal'
import ModalHeader from './modal/ModalHeader'
import FormField from './FormField'
import ModalBody from './modal/ModalBody'
import PillsContainer from './PillsContainer'
import Pill from './Pill'
import {LABELS} from '../constants/Labels'
import ModalActions from './modal/ModalActions'
import { Colors, LabelColors } from '../constants/Colors'
import AnimatedPressable from './AnimatedPressable'
import ThemedText from './ThemedText'
import ThemedIcon from './ThemedIcon'
import Spacer from './Spacer'
import ThemedView from './ThemedView'
import {columnService} from '../api/columnService'
import AssignMembersSection from "./AssignMembersSection";
import { useRouter, useFocusEffect } from 'expo-router'

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
    userEmail,
    onChange,
    getProjectUsers,
}) {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const router = useRouter() // for hints page

    const currentIndex = columns?.findIndex(c => c.id === columnId) ?? -1
    const prevColumn = currentIndex > 0 ? columns[currentIndex - 1] : null
    const nextColumn = currentIndex < (columns?.length - 1) ? columns[currentIndex + 1] : null

    const handleMove = async (targetColumn) => {
        await columnService.moveTaskToColumn(projectId, task, columnId, targetColumn)
        onTaskMoved?.()  // close modal after move
    }

    const [isEdit, setIsEdit] = useState(false);
    const [editedTask, setEditedTask] = useState(null);

    // Calculate labelIcon based on current label (recalculated on each render)
    const labelIcon = LABELS.find(label => label.name === (isEdit ? editedTask?.label : task?.label))?.icon
    
    const taskHasHints = !!(task?.hints)

    const handleEditToggle = () => {
        if (!isEdit) {
            // Entering edit mode - copy current task to edited task
            setEditedTask({
                name: task?.name,
                description: task?.description,
                label: task?.label,
                assignedMembers: task?.assignedMembers,
            });
            setIsEdit(true);
        } else {
            // Exiting edit mode without saving
            setEditedTask(null);
            setIsEdit(false);
        }
    }

    const handleEditChange = (field, value) => {
        setEditedTask((prev) => ({ ...prev, [field]: value }));
    }

    const handleSaveEdit = async () => {
        try {
            // Update the task with new values
            await columnService.updateTask(projectId, columnId, task.id, {
                name: editedTask.name,
                description: editedTask.description,
                label: editedTask.label,
                assignedMembers: editedTask.assignedMembers,
            });
            // Update the displayed task with changes
            onChange('name', editedTask.name);
            onChange('description', editedTask.description);
            onChange('assignedMembers', editedTask.assignedMembers);
            onChange('label', editedTask.label);
            setIsEdit(false);
            setEditedTask(null);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }

    const handleCancelEdit = () => {
        setEditedTask(null);
        setIsEdit(false);
    }

    const handleCloseModal = () => {
        setEditedTask(null);
        setIsEdit(false);
        onClose();
    }

    const handlePressHints = () => {
        router.push({ pathname: '/hintViewer', params: {projectId, projectName, columnId, columnName, taskId: task.id, taskName: task.name} })
    }

     useFocusEffect(
        useCallback(() => {
            if (visible && projectId && columnId && task?.id) {
                const refetchTask = async () => {
                    const updatedTask = await columnService.getTask(projectId, columnId, task.id)
                    if (updatedTask) {
                        onChange('hints', updatedTask.hints)
                    }
                    // if task not found (moved to another column, e.g.) do nothing.
                }
                refetchTask()
            }
        }, [visible, projectId, columnId, task?.id, onChange])
    )


    return (
        <AppModal visible={visible} onClose={onClose}>
            <ModalHeader
                heading={!isEdit ? "Task Details" : "Task Editing"}
                iconName="checkbox-outline"
                onClose={handleCloseModal}
                secondAction={handleEditToggle}
                secondActionIcon={"pencil"}
            />
            <ThemedView style={styles.columnNav}>
                {prevColumn ? (
                    <AnimatedPressable
                        testID="move-task-prev-column-button"
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
                        testID="move-task-next-column-button"
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
                    {(isEdit ? editedTask?.label : task?.label) && (
                        <Pill
                            name={isEdit ? editedTask?.label : task?.label}
                            iconName={labelIcon}
                            pressable={isEdit}
                            onPress={isEdit ? () => handleEditChange('label', '') : null}
                            customStyle={{
                                backgroundColor: LabelColors[isEdit ? editedTask?.label : task?.label] ? LabelColors[isEdit ? editedTask?.label : task?.label] + '50' : LabelColors.default + '50'
                            }}
                        />
                    )}
                </PillsContainer>

                <Spacer height={10} />

                <FormField
                    labelName="TASK NAME"
                    value={isEdit ? editedTask?.name : task?.name}
                    readOnly={!isEdit}
                    onChangeText={isEdit ? (value) => handleEditChange('name', value) : null}
                />

                <FormField
                    labelName="DESCRIPTION"
                    placeholder="No description provided."
                    value={isEdit ? editedTask?.description : task?.description}
                    multiline
                    readOnly={!isEdit}
                    onChangeText={isEdit ? (value) => handleEditChange('description', value) : null}
                />

                

                {taskHasHints ? (
                    <>
                        <ThemedText style={styles.label}>
                            Hints
                        </ThemedText>
                        <AnimatedPressable
                            testID="hints-button"
                            style={[styles.hintButton, { backgroundColor: theme.hint, boxShadow: `0px 0px 5px ${theme.hint}` }]}
                            onPress={handlePressHints}
                        >
                            <ThemedIcon onPrimary name="lightbulb-on-outline" />
                            <ThemedText onPrimary style={{ marginLeft: 8 }}>
                                See hints
                            </ThemedText>
                        </AnimatedPressable>
                    </>
                ) : null}

                

                {isEdit ? (
                    <>
                        <FormField
                            labelName="LABELS"
                            placeholder="Enter or select label"
                            value={editedTask?.label}
                            onChangeText={(text) => handleEditChange('label', text)}
                        />
                        <PillsContainer style={{ marginBottom: 15 }}>
                            {LABELS.map((label) => {
                                const isSelected = (editedTask?.label === label.name)
                                const labelColorForPill = LabelColors[label.name] || LabelColors.default;

                                return (
                                    <Pill
                                        key={label.name}
                                        name={label.name}
                                        iconName={label.icon}
                                        pressable
                                        onPress={() => handleEditChange('label', isSelected ? '' : label.name)}
                                        customStyle={isSelected && { backgroundColor: `${labelColorForPill}50` }}
                                    />
                                );
                            })}
                        </PillsContainer>
                    </>
                ): null }

                {!isEdit ? (
                    <FormField
                        labelName="ASSIGNED TO"
                        value={
                            task?.assignedMembers && task.assignedMembers.length > 0
                                ? task.assignedMembers.map(member => member.email === userEmail ? "Me" : member.email).join(', ')
                                : "No one"
                        }
                        readOnly
                    />
                ) : (
                    <AssignMembersSection
                        assignedMembers={editedTask?.assignedMembers}
                        onAssignedMembersChange={(members) => handleEditChange('assignedMembers', members)}
                        getProjectUsers={getProjectUsers}
                        visible={visible}
                    />
                )}

            </ModalBody>

            <ModalActions
                onCancel={isEdit ? handleCancelEdit : onClose}
                primaryActionName={!isEdit ? "Finish Task" : "Save"}
                primaryActionIconName={!isEdit ? "check" : "check"}
                onPrimaryActionPress={!isEdit ? () => deleteTask(task) : handleSaveEdit}
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
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 7,
        opacity: 0.7
    },
    hintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10
    },
    pillsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
})
