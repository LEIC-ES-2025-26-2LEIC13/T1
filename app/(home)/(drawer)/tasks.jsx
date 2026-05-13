// themed components
import SafeAreaPage from '../../../components/SafeAreaPage'
import { FlatList, StyleSheet } from "react-native";
import { taskService } from '../../../api/taskService';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import EmptyState from '../../../components/EmptyState';
import ThemedTask from '../../../components/ThemedTask';
import TaskModal from '../../../components/TaskModal';
import ThemedAlert, { ALERT_TYPES } from '../../../components/ThemedAlert';
import ThemedText from '../../../components/ThemedText';
import Divider from '../../../components/Divider';
import Spacer from '../../../components/Spacer';

const Tasks = () => {
    const { user } = useAuth()
    const [ userTasks, setUserTasks ] = useState([])
    const [ selectedTask, setSelectedTask ] = useState(null)
    const [ taskDetailsVisible, setTaskDetailsVisible ] = useState(false)

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ title: '', message: '' });
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    }

    // Subscribe to real-time updates of user tasks
    useEffect(() => {
        if (!user?.uid) {
            return
        }

        const unsub = taskService.subscribeToUserTasks(user.uid, (tasksToDisplay) => {
            setUserTasks(tasksToDisplay)
        })
        
        return () => unsub()
    }, [user?.uid])

    const openTaskDetails = (taskItem) => {
        setSelectedTask(taskItem)
        setTaskDetailsVisible(true)
    }

    const closeTaskDetails = () => {
        setTaskDetailsVisible(false)
        setSelectedTask(null)
    }

    const handleDeleteTask = async (task) => {
        try {
            await taskService.deleteTask(selectedTask.projectId, selectedTask.columnId, task.id, task.assignedMembers)
            closeTaskDetails()
        }
        catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Delete Task Failed", error.message)
        }
    }
    
    let previousProjectName = null

    return(
        <SafeAreaPage style={styles.container}>
            
            <FlatList
                data={userTasks}
                keyExtractor={(item) => item.id}

                contentContainerStyle={[
                    styles.list,
                    (userTasks.length === 0) && styles.listEmpty
                ]}

                showsVerticalScrollIndicator={false}

                ListEmptyComponent={<EmptyState
                    title="No tasks assigned"
                    subtitle="When a task is assigned to you, it will appear here"
                    iconName="beach"
                />}

                renderItem={({ item }) => {
                    const showProjectLabel = item.projectName !== previousProjectName
                    previousProjectName = item.projectName // Update previousProjectName to current task's project name
                    return (
                        <>
                            {showProjectLabel && (
                                <>
                                    <Spacer height={10} />
                                    <ThemedText style={[styles.label]}>
                                        {item.projectName}
                                    </ThemedText>
                                    <Divider />
                                    <Spacer height={10} />
                                </>
                            )}

                            <ThemedTask onBackground
                                task={item}
                                onPress={() => openTaskDetails(item)}
                            />
                        </>
                    )
                }}
            />

            <TaskModal
                visible={taskDetailsVisible}
                task={selectedTask}
                projectName={selectedTask?.projectName}
                columnName={selectedTask?.columnName}
                onClose={closeTaskDetails}
                deleteTask={handleDeleteTask}
            />

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)}
            />
            
        </SafeAreaPage>
    )
}

export default Tasks;

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16
    },
    
    list: {
        paddingVertical: 16,
    },

    listEmpty: {
        flex: 1,
        marginTop: 50
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 7,
        opacity: 0.7
    }
});