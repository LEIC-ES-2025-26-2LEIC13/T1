import React, {useState, useCallback} from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import AppModal from './AppModal'
import ModalHeader from './modal/ModalHeader'
import FormField from './FormField'
import ModalBody from './modal/ModalBody'
import PillsContainer from './PillsContainer'
import Pill from './Pill'
import ModalActions from './modal/ModalActions'
import AnimatedPressable from './AnimatedPressable'
import ThemedText from './ThemedText'
import ThemedIcon from './ThemedIcon'
import Spacer from './Spacer'
import ThemedView from './ThemedView'
import { templateColumnService } from '../api/templateColumnService'
import { Colors } from '../constants/Colors'
import { useRouter, useFocusEffect } from 'expo-router'

export default function TemplateTaskModal({
    visible,
    task,
    templateName,
    columnName,
    onClose,
    deleteTask,
    templateId,
    columns,        
    columnId,       
    onTaskMoved,
    userEmail,
    onChange
}) {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const router = useRouter() // for hints page

    const currentIndex = columns?.findIndex(c => c.id === columnId) ?? -1
    const prevColumn = currentIndex > 0 ? columns[currentIndex - 1] : null
    const nextColumn = currentIndex < (columns?.length - 1) ? columns[currentIndex + 1] : null

    const handleMove = async (targetColumn) => {
        await templateColumnService.moveTaskToColumn(templateId, task, columnId, targetColumn)
        onTaskMoved?.()  // close modal after move
    }

    const [isEdit, setIsEdit] = useState(false);
    const [editedTask, setEditedTask] = useState(null);

    const handleEditToggle = () => {
        if (!isEdit) {
            setEditedTask({
                name: task?.name,
                description: task?.description,
            });
            setIsEdit(true);
        } else {
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
            await templateColumnService.updateTask(templateId, columnId, task.id, {
                name: editedTask.name,
                description: editedTask.description
            });

            // Update the displayed task with changes
            onChange('name', editedTask.name)
            onChange('description', editedTask.description)
            setIsEdit(false)
            setEditedTask(null)

        } catch (error) {
            console.error('Error saving task:', error)
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

    const handlePressHint = () => {
        router.push({ pathname: '/hintEditor', params: { templateId, templateName, columnId, columnName, taskId: task.id, taskName: task.name } })
    }

     // Refetch task data when returning from hint editor
    useFocusEffect(
        useCallback(() => {
            if (visible && templateId && columnId && task?.id) {
                const refetchTask = async () => {
                    try {
                        const updatedTask = await templateColumnService.getTask(templateId, columnId, task.id)
                        if (updatedTask) {
                            onChange('hints', updatedTask.hints)
                        }
                    } catch (error) {
                        console.error('Error refetching task:', error)
                    }
                }
                refetchTask()
            }
        }, [visible, templateId, columnId, task?.id, onChange])
    )

    const taskHasHints = !!(task?.hints)

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
                    <Pill projectName={templateName} />
                    <Pill columnName={columnName} />
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

                <ThemedText style={[styles.label]}>
                    Hints
                </ThemedText>

                <AnimatedPressable
                    testID="hints-button"
                    onPress={handlePressHint}
                    style={[styles.hintButton, { backgroundColor: theme.hint , boxShadow: `0px 0px 5px ${theme.hint}`}]}                >
                    <ThemedIcon onPrimary name="lightbulb-on-outline"/>
                    <ThemedText onPrimary style={{ marginLeft: 8 }}>{taskHasHints ? "See hints" : "No hints yet. Add hints."}</ThemedText>
                </AnimatedPressable>
            
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
    }
})
