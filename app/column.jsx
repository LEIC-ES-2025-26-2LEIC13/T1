import { useState, useEffect } from "react"
import Task from "../components/ThemedTask";
import { useColumn } from '../hooks/useColumn'
import { taskService } from '../api/taskService';
import ThemedText from "../components/ThemedText";
import ThemedButton from "../components/ThemedButton";
import OverflowMenu from '../components/OverflowMenu';
import TaskModal from '../components/TaskModal';
import { View, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import CreateTaskModal from '../components/CreateTaskModal';
import EditColumnModal from '../components/EditColumnModal';

export default function Column({ projectId, projectName, columnData }) {
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
            Alert.alert('Column Update Failed', error.message)
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
            Alert.alert('Task Creation Failed', error.message)
        }
    }

    const handleDeleteTask = async (taskId) => {
        try {
            await taskService.deleteTask(projectId, column.id, taskId)
            closeTaskDetails()
        }
        catch (error) {
            Alert.alert('Delete Failed', error.message)
        }
    }

    return (
        <View style={styles.container}>

            {/* Column Header */}
            <View style={styles.header}>
                <ThemedText style={styles.columnName}>{column.name}</ThemedText>
                <OverflowMenu
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
                                title: 'Delete column',
                                message: 'Are you sure you want to delete this column? All related data will be lost.',
                            },
                            destructive: true,
                            onPress: () => deleteColumn(column.id)
                        }
                    ]}
                />
            </View>

            {/* Task List */}
            {isLoadingTasks ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Task
                            task={item}
                            onPress={() => openTaskDetails(item)}  // modal state lives here now
                        />
                    )}
                    ListEmptyComponent={
                        <ThemedText style={styles.empty}>No tasks yet</ThemedText>
                    }
                    contentContainerStyle={styles.list}
                />
            )}

            {/* Create Task Button */}
            <ThemedButton onPress={openTaskCreationModal} style={styles.btn}>
                <ThemedText style={styles.btnText}>+ Add Task</ThemedText>
            </ThemedButton>

            <EditColumnModal
                visible={editColumnModalVisible}
                onClose={closeEditColumnModal}
                onEdit={handleEditColumn}
                columnData={column}
            />

            {/* Modals — scoped to this column */}
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
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        margin: 5,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    columnName: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    list: {
        flexGrow: 1,
    },

    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },

    btn: {
        marginTop: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
})