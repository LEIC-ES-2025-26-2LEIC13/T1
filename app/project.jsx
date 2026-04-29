import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, Text, FlatList } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import InviteWorkspaceModal from '../components/InviteWorkspaceModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskModal from '../components/TaskModal';
import ThemedButton from "../components/ThemedButton";
import ThemedText from "../components/ThemedText";
import Task from "../components/ThemedTask";
import { useProject } from '../hooks/useProject';
import { useAuth } from '../hooks/useAuth';
import { useInvite } from '../hooks/useInvite';
import { useTask } from '../hooks/useTask';
import { userService } from '../api/userService';
import { projectService } from '../api/projectService';
import OverflowMenu from '../components/OverflowMenu';
import SeeMembersModal from '../components/SeeMembersModal';

export default function Home() {
  	const router = useRouter();
	const params = useLocalSearchParams(); // Routing parameters of the current screen
	// For example: /project?projectId=abc -> params.projectId will be abc

	const scheme = useColorScheme();
	const palette = Colors[scheme] ?? Colors.light;

  	const { projects, deleteProject, kickMember } = useProject(); // user projects
  	const { user } = useAuth();

  	const { sendInvite } = useInvite();
  	const { tasks, createTask, deleteTask, setActiveProjectId } = useTask();

	const [task, setTask] = useState({
		name: '',
		description: '',
		label: '',
  	});

	const handleTaskChange = (field, value) => {
		setTask((prev) => ({ ...prev, [field]: value }));
	};

	const [ inviteTarget, setInviteTarget ] = useState('');

	const [ taskModalCreationVisible, setTaskModalCreationVisible ] = useState(false);
	const [ taskDetailsVisible, setTaskDetailsVisible ] = useState(false);
	const [ selectedTask, setSelectedTask ] = useState(null);
	
	const [ inviteModalVisible, setInviteModalVisible ] = useState(false);
	const [ seeMembersModalVisible, setSeeMembersModalVisible ] = useState(false);

	// Search for current project in the user's projects
	const projectId = params.projectId;
	const currentProject = projects.find((project) => project.id === projectId);
	const currentProjectName = currentProject?.title ?? 'Project';
	
	// sets projectId for Task context
	useEffect(() => {
		setActiveProjectId(projectId ?? '');

		return () => {
		setActiveProjectId('');
		};
	}, [projectId, setActiveProjectId]);

  	// Invite modal
  	const handleInvitePress = () => setInviteModalVisible(true);

  	const handleCloseInviteModal = () => {
		setInviteModalVisible(false);
		setInviteTarget('');
	};

	// Task Creation Modal
	const openTaskCreationModal = () => setTaskModalCreationVisible(true);

	const closeTaskCreationModal = () => {
		setTaskModalCreationVisible(false);
		setTask({
			name: '',
			description: '',
			label: '',
		});
	};

	// Task Details Modal

	const openTaskDetails = (taskItem) => {
		setSelectedTask(taskItem);
		setTaskDetailsVisible(true);
	};

	const closeTaskDetails = () => {
		setTaskDetailsVisible(false);
		setSelectedTask(null);
	};

	// Handlers

	const handleCreateTask = async (taskData) => {
		try{
		await createTask(taskData);
		closeTaskCreationModal();
		} catch (error) {
		Alert.alert('Error', error.message);
		}
	};

	const handleDeleteTask = async (taskId) => {
		try {
		await deleteTask(taskId);
		closeTaskDetails();
		} catch (error) {
		Alert.alert('Error', error.message);
		}
	};

	// See members modal
	const handleSeeMembersPress = () => setSeeMembersModalVisible(true);
	const handleCloseMembersModal = () => setSeeMembersModalVisible(false);

	const handleGoBack = () => {
		try {
		if (router.canGoBack()) {
			router.back();
			return;
		}

		router.replace('/');
		} catch {
		router.replace('/');
		}
  	};


	const handleSendInvite = async () => {
		const trimmedTarget = inviteTarget.trim().toLowerCase();

		if (!trimmedTarget) {
		Alert.alert('Missing user', 'Please enter a valid email.');
		return;
		}

		try {
		const receiverUser = await userService.getUserByEmail(trimmedTarget);

		if (!receiverUser) {
			Alert.alert('User not found', 'No registered user matches that email.');
			return;
		}

		if (receiverUser.id === user.uid) {
			Alert.alert('Invalid invite', 'You cannot invite yourself.');
			return;
		}

		if (!currentProject?.id) {
			Alert.alert('Project unavailable', 'Unable to find this project.');
			return;
		}

		await sendInvite({
			senderId: user.uid,
			senderEmail: user.email,
			receiverId: receiverUser.id,
			projectId: currentProject.id,
			projectName: currentProject.title,
		});

		handleCloseInviteModal();
		Toast.show({
			type: 'success',
			text1: 'Invite sent',
			text2: `Invitation sent to ${trimmedTarget}.`,
			position: 'top',
			visibilityTime: 1500,
			topOffset: 100,
		});
		} catch (error) {
			Alert.alert('Invalid invite', error.message);
		}
	};

	const handleProjectDelete = async () => {
		try {
			await deleteProject(projectId)
			handleGoBack()
		}
		catch (error) {
			console.log('Delete Failed', error.message)
		}
	}

	const handleKickMember = async (projectId, userId, userEmail) => {
			try { // maybe place this logic inside the context
				await kickMember(projectId, userId)

				let alertMessage
				if (userId === user.uid) {
					alertMessage = "Successfully left the project."
					handleGoBack() // navigate away when leaving project

					// To prevent unaccessible projects (leaks)
					if (await projectService.projectHasNoMembers(projectId)) {
            			await projectService.deleteProject(projectId)
        			}	

				} else {
					alertMessage = `Successfully kicked ${userEmail}.`
				}

				Alert.alert('Success', alertMessage)
			}
			catch (error) {
				console.log('Kick fail', error.message)
			}
	}

  	return (
		<>
			<Stack.Screen
				options={{

				headerTitle: () => (
					<ThemedText title={true} style={{ fontSize: 18, fontWeight: 'bold' }}>
						{currentProjectName}
					</ThemedText>
				),

				headerLeft: () => (
					<Pressable onPress={handleGoBack} hitSlop={10} style={{
					width: 40,
					height: 40,
					justifyContent: 'center',
					alignItems: 'center',
					}}>
						<Ionicons name="arrow-back" size={24} color={palette.title} />
					</Pressable>
				),

				headerRight: () => (
					<>
						<Pressable onPress={handleSeeMembersPress} hitSlop={10} style={{
						width: 40,
						height: 40,
						justifyContent: 'center',
						alignItems: 'center',
						}}>
							<Ionicons name="people" size={24} color={palette.title} />
						</Pressable>

						<OverflowMenu 
							actions={[
								{
									id: 'invite-member',
									title: 'Invite member',
									icon: 'person-add',
									onPress: () => handleInvitePress(),
								},
								{
									id: 'delete-project',
									title: 'Delete project',
									icon: 'remove-circle',
									confirm: {
										title: 'Delete project',
										message: 'Are you sure you want to delete this project?',
									},
									destructive: true, // If we place a string of text that is not null, 
									// it will be marked as a destructive action
									onPress: () => handleProjectDelete(),
								}
							]}
						/>
					</>
				),
				headerStyle: {
					backgroundColor: palette.navBackground,
					borderBottomWidth: 1,
					borderBottomColor: '#e5e7eb',
				},
				headerTintColor: palette.title,
				headerShadowVisible: false,
			}}
			/>

			<SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
				<InviteWorkspaceModal
					visible={inviteModalVisible}
					value={inviteTarget}
					onChangeText={setInviteTarget}
					onClose={handleCloseInviteModal}
					onInvite={handleSendInvite}
					workspaceName={currentProjectName}
				/>

				<SeeMembersModal
				visible={seeMembersModalVisible}
				getProjectUsers={() => projectService.getProjectUsers(projectId)}
				onClose={handleCloseMembersModal}
				onKickMember={(userId, userEmail) => handleKickMember(projectId, userId, userEmail)}
				/>
				
				<FlatList
					data={tasks ?? []}
					style={styles.list}
					contentContainerStyle={styles.listContent}
					keyExtractor={(item, index) => `${item.name}-${index}`}
					renderItem={({ item }) => (
						<Task
							task={item}
							onPress={() => openTaskDetails(item)}
						/>
					)}
				/>

				<ThemedButton onPress={openTaskCreationModal} style={styles.btn}>
					<Text style={[styles.btnText ,{ marginRight: 20 }]}>+</Text>
					<Text style={styles.btnText}>Create Task</Text>
				</ThemedButton>

				<CreateTaskModal
				isVisible={taskModalCreationVisible}
				onClose={closeTaskCreationModal}
				onCreate={handleCreateTask}
				task={task}
				onChange={handleTaskChange}
				projectName={currentProjectName}
				/>

				<TaskModal
				visible={taskDetailsVisible}
				onClose={closeTaskDetails}
				task={selectedTask}
				deleteTask={handleDeleteTask}
				/>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
  container: {
	flex: 1,
  },

  btn:{
	width: '85%',

	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',

	padding: 12,

	position: 'absolute',
	bottom: 20,
	alignSelf: 'center',

	marginBottom: 20,
  },

  btnText: {
	color: 'white',
	fontSize: 16,
	fontWeight: 'bold',
  }
});
