import { useState, useEffect } from "react"
import ThemedTask from "../components/ThemedTask";
import { useColumn } from '../hooks/useColumn'
import { taskService } from '../api/taskService';
import ThemedText from "../components/ThemedText";
import ThemedButton from "../components/ThemedButton";
import OverflowMenu from '../components/OverflowMenu';
import TaskModal from '../components/TaskModal';
import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import CreateTaskModal from '../components/CreateTaskModal';
import EditColumnModal from '../components/EditColumnModal';
import EmptyState from "../components/EmptyState";
import ThemedAlert, { ALERT_TYPES } from "../components/ThemedAlert";
import LoadingScreen from "../components/LoadingScreen";
import { Colors } from "../constants/Colors";
import Divider from "../components/Divider";
import Spacer from "../components/Spacer";
import ThemedIcon from "../components/ThemedIcon";

export default function Column({ projectId, projectName, columnData }) {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { deleteColumn, updateColumn } = useColumn()
    const [column, setColumn] = useState({
        id: columnData.id,
        name: columnData.name
    })
    const [tasks, setTasks] = useState([])
    const [isLoadingTasks, setIsLoadingTasks] = useState(false)
    const [taskModalCreationVisible, setTaskModalCreationVisible] = useState(false)
    const [taskDetailsVisible, setTaskDetailsVisible] = useState(false)
    const [editColumnModalVisible, setEditColumnModalVisible] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [task, setTask] = useState({ // this state holds each task field while the user fills out a form when creating a task, e.g.
        name: '',
        description: '',
        label: '',
    })

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ title: '', message: '' });
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    }

    // Listener to single column task updates
    useEffect(() => {
        setIsLoadingTasks(true)
        const unsub = taskService.subscribeToColumnTasks(projectId, column.id, (tasksToDisplay) => {
            setTasks(tasksToDisplay)
            setIsLoadingTasks(false)
        })
        return () => unsub()
    }, [projectId, column.id])

    useEffect(() => {
        setColumn({
            id: columnData.id,
            name: columnData.name
        })
    }, [columnData])


    const handleEditColumn = async (updatedColumnData) => {
        try {
            await updateColumn(column.id, updatedColumnData)
            setEditColumnModalVisible(false)
        }
        catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Column Update Failed", error.message)
        }
    }
    const openEditColumnModal = () => setEditColumnModalVisible(true)

    const closeEditColumnModal = () => setEditColumnModalVisible(false)

    // used for updating task state fields inside CreateTaskModal (as the user fills the create task form)
    const handleTaskChange = (field, value) => {
        setTask((prev) => ({ ...prev, [field]: value }));
    };

    // Task Creation Modal
    const openTaskCreationModal = () => setTaskModalCreationVisible(true)

    const closeTaskCreationModal = () => {
        setTaskModalCreationVisible(false)
        setTask({
            name: '',
            description: '',
            label: '',
        })
    }

    // Task Details Modal

    const openTaskDetails = (taskItem) => {
        setSelectedTask(taskItem)
        setTaskDetailsVisible(true)
    }

    const closeTaskDetails = () => {
        setTaskDetailsVisible(false)
        setSelectedTask(null)
    }

    const handleCreateTask = async (taskData) => {
        try {
            await taskService.createTask(projectId, column.id, taskData)
            closeTaskCreationModal()
        }
        catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Task Creation Failed", error.message)
        }
    }

    const handleDeleteTask = async (taskId) => {
        try {
            await taskService.deleteTask(projectId, column.id, taskId)
            closeTaskDetails()
        }
        catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Delete Task Failed", error.message)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.navBackground, borderColor: theme.borders }]} >

            {/* Column Header */}
            <View style={styles.header}>

                <ThemedText bold style={{ fontSize: 18 }}>
                    {column.name}
                </ThemedText>

                <OverflowMenu
                    customColor={theme.background}
                    actions={[
                        {
                            id: 'edit',
                            title: 'Edit column name',
                            icon: 'pencil',
                            onPress: () => openEditColumnModal()
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
                            onPress: () => deleteColumn(column.id)
                        }
                    ]}
                />
            </View>

            <Spacer height={15}/>
            <Divider />
            <Spacer height={10}/>

            {/* Task List */}
            {isLoadingTasks ? 
                <LoadingScreen loadingText="Loading tasks..." />
             :
                <>
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}

                        contentContainerStyle={
                            styles.list,
                            (tasks.length === 0) && { flex: 1 }
                        }

                        showsVerticalScrollIndicator={false}

                        renderItem={({ item }) => (
                            <ThemedTask
                                task={item}
                                onPress={() => openTaskDetails(item)}  // modal state lives here now
                            />
                        )}
                        ListEmptyComponent={
                            <EmptyState
                                title="No tasks yet"
                                subtitle="Create the first task in this column using the button below"
                                iconName="note"
                            />
                        }
                    />

                    
                    <ThemedButton onPress={openTaskCreationModal}>
                        <ThemedIcon name="plus" onPrimary/>
                        <ThemedText bold onPrimary>Create Task</ThemedText>
                    </ThemedButton>

                    <EditColumnModal
                        visible={editColumnModalVisible}
                        onClose={closeEditColumnModal}
                        onEdit={handleEditColumn}
                        columnData={column}
                    />

                    <CreateTaskModal
                        visible={taskModalCreationVisible}
                        task={task}
                        projectName={projectName}
                        columnName={column.name}
                        onClose={closeTaskCreationModal}
                        onCreate={handleCreateTask}
                        onChange={handleTaskChange}
                    />
                    <TaskModal
                        visible={taskDetailsVisible}
                        task={selectedTask}
                        projectName={projectName}
                        columnName={column.name}
                        onClose={closeTaskDetails}
                        deleteTask={handleDeleteTask}
                    />

                    <ThemedAlert
                        visible={alertVisible}
                        alert={alert}
                        onConfirm={() => setAlertVisible(false)} 
                    />
                </>
            }
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        padding: 20,
        marginVertical: 10
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    list: {
        paddingVertical: 16
    }
})