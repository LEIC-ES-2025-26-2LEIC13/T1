import { useState, useEffect, useCallback } from "react";
import ThemedTask from "../../components/ThemedTask";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import OverflowMenu from '../../components/OverflowMenu';
import TemplateTaskModal from '../../components/TemplateTaskModal';
import { View, StyleSheet, useColorScheme } from 'react-native';
import EditColumnModal from '../../components/EditColumnModal';
import EmptyState from "../../components/EmptyState";
import ThemedAlert, { ALERT_TYPES } from "../../components/ThemedAlert";
import LoadingScreen from "../../components/LoadingScreen";
import { Colors } from "../../constants/Colors";
import Divider from "../../components/Divider";
import Spacer from "../../components/Spacer";
import ThemedIcon from "../../components/ThemedIcon";
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTemplate } from "../../hooks/useTemplate";
import { templateColumnService } from "../../api/templateColumnService";
import TemplateCreateTaskModal from "../../components/TemplateCreateTaskModal";

export default function TemplateColumn({ templateId, templateName, columnData, columns }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { deleteColumn, updateColumn } = useTemplate();

    const [column, setColumn] = useState({
        id: columnData.id,
        name: columnData.name,
    });
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [taskModalCreationVisible, setTaskModalCreationVisible] = useState(false);
    const [taskDetailsVisible, setTaskDetailsVisible] = useState(false);
    const [editColumnModalVisible, setEditColumnModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [task, setTask] = useState({
        name: '',
        description: ''
    });

    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    useEffect(() => {
        setIsLoadingTasks(true);
        const unsub = templateColumnService.subscribeToColumnTasks(templateId, column.id, (tasksToDisplay) => {
            setTasks(tasksToDisplay);
            setIsLoadingTasks(false);
        });
        return () => unsub();
    }, [templateId, column.id]);

    useEffect(() => {
        setColumn({ id: columnData.id, name: columnData.name });
    }, [columnData]);

    const handleEditColumn = async (updatedColumnData) => {
        try {
            await updateColumn(column.id, updatedColumnData);
            setEditColumnModalVisible(false);
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Column Update Failed", error.message);
        }
    };

    const handleTaskChange = (field, value) => {
        setTask((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectedTaskChange = (field, value) => {
        if (selectedTask) {
            setSelectedTask((prev) => ({ ...prev, [field]: value }));
        }
    };

    const openTaskCreationModal = () => setTaskModalCreationVisible(true);

    const closeTaskCreationModal = () => {
        setTaskModalCreationVisible(false);
        setTask({ name: '', description: '' });
    };

    const openTaskDetails = (taskItem) => {
        setSelectedTask(taskItem);
        setTaskDetailsVisible(true);
    };

    const closeTaskDetails = () => {
        setTaskDetailsVisible(false);
        setSelectedTask(null);
    };

    const handleCreateTask = async (taskData) => {
        try {
            await templateColumnService.createTask(templateId, column.id, taskData);
            closeTaskCreationModal();
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Task Creation Failed", error.message);
        }
    };

    const handleDeleteTask = async (task) => {
        try {
            await templateColumnService.deleteTask(templateId, column.id, task.id);
            closeTaskDetails();
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Delete Task Failed", error.message);
        }
    }

    const handleReorder = useCallback(({ from, to }) => {
        setTasks(prevTasks => {
            const reordered = reorderItems(prevTasks, from, to); // Reorder the tasks in the UI immediately

            // Update the order in the backend
            templateColumnService.reorderColumnTasks(templateId, columnData.id, reordered, from, to)
                .catch((error) => {
                    showAlert(ALERT_TYPES.ERROR, "Reorder Failed", error.message);
                });

            return reordered;
        });
    }, [templateId, columnData.id]);


    const DraggableTask = ({ item, onPress, testID }) => {
        const drag = useReorderableDrag();
        return (
            <ThemedTask
                task={item}
                testID={testID}
                onPress={onPress}
                onBackground={false}
                onLongPress={drag}
            />
        );
    };

    const renderItem = useCallback(({ item }) => (
        <DraggableTask
            testID={`task-${item.name}-${item.order}`}
            item={item}
            onPress={() => openTaskDetails(item)}
        />
    ), []);

    return (
        <View style={[styles.container, { backgroundColor: theme.navBackground, borderColor: theme.borders }]}>
            <View style={styles.header}>
                <ThemedText bold style={{ fontSize: 18 }}>{column.name}</ThemedText>
                <OverflowMenu
                    customColor={theme.background}
                    actions={[
                        {
                            id: 'edit',
                            title: 'Edit column name',
                            icon: 'pencil',
                            onPress: () => setEditColumnModalVisible(true),
                        },
                        {
                            id: 'delete',
                            title: 'Delete column',
                            icon: 'delete',
                            confirm: {
                                title: 'Delete Column',
                                message: 'Are you sure you want to delete this column? All related data will be lost.',
                            },
                            destructive: true,
                            onPress: () => deleteColumn(column.id),
                        },
                    ]}
                />
            </View>

            <Spacer height={15} />
            <Divider />
            <Spacer height={10} />

            {isLoadingTasks ? (
                <LoadingScreen loadingText="Loading tasks..." />
            ) : (
                <>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                    <ReorderableList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        onReorder={handleReorder}
                        contentContainerStyle={[
                            styles.list,
                            tasks.length === 0 && { flex: 1 },
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                title="No tasks yet"
                                subtitle="Create the first task in this column using the button below"
                                iconName="note"
                            />
                        }
                    />
                    </GestureHandlerRootView>

                    
                    <ThemedButton testID="open-create-task-modal-button" onPress={openTaskCreationModal}>
                        <ThemedIcon name="plus" onPrimary/>
                        <ThemedText bold onPrimary>Create Task</ThemedText>
                    </ThemedButton>

                    <EditColumnModal
                        visible={editColumnModalVisible}
                        onClose={() => setEditColumnModalVisible(false)}
                        onEdit={handleEditColumn}
                        columnData={column}
                    />

                    <TemplateCreateTaskModal
                        visible={taskModalCreationVisible}
                        task={task}
                        projectName={templateName}
                        columnName={column.name}
                        onClose={closeTaskCreationModal}
                        onCreate={handleCreateTask}
                        onChange={handleTaskChange}
                        template
                    />

                    <TemplateTaskModal
                        visible={taskDetailsVisible}
                        task={selectedTask}
                        templateName={templateName}
                        columnName={column.name}
                        onClose={closeTaskDetails}
                        deleteTask={handleDeleteTask}
                        templateId={templateId}         
                        columns={columns}             
                        columnId={column.id}
                        onTaskMoved={closeTaskDetails} 
                        onChange={handleSelectedTaskChange}
                    />

                    <ThemedAlert
                        visible={alertVisible}
                        alert={alert}
                        onConfirm={() => setAlertVisible(false)}
                    />
                </>
            )}
        </View>
    
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        padding: 20,
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    list: {
        paddingVertical: 16,
    },
});
