import { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import InviteProjectModal from '../components/InviteProjectModal';
import ThemedText from "../components/ThemedText";
import { useProject } from '../hooks/useProject';
import { useAuth } from '../hooks/useAuth';
import { useInvite } from '../hooks/useInvite';
import { useColumn }  from '../hooks/useColumn'
import { userService } from '../api/userService';
import { projectService } from '../api/projectService';
import OverflowMenu from '../components/OverflowMenu';
import SeeMembersModal from '../components/SeeMembersModal';
import PagerView from 'react-native-pager-view';
import Column from './column';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CreateColumnModal from '../components/CreateColumnModal';
import ThemedIcon from '../components/ThemedIcon';
import EmptyState from '../components/EmptyState';

export default function ProjectScreen() {
  	const router = useRouter()
	const params = useLocalSearchParams() // Routing parameters of the current screen
	// For example: /project?projectId=abc -> params.projectId will be abc

	const scheme = useColorScheme()
	const palette = Colors[scheme] ?? Colors.light

  	const { projects, deleteProject, kickMember } = useProject(); // user 
	const [deleting, setDeleting] = useState(false) 
  	const { user } = useAuth();

	const { columns, setActiveProjectId, createColumn} = useColumn()
	const [ createColumnModalVisible, setCreateColumnModalVisible ] = useState(false)

  	const { sendInvite } = useInvite()
	const [ inviteTarget, setInviteTarget ] = useState('')
	
	const [ inviteModalVisible, setInviteModalVisible ] = useState(false)
	const [ seeMembersModalVisible, setSeeMembersModalVisible ] = useState(false)

	// Search for current project in the user's projects
	const projectId = params.projectId
	const currentProject = projects.find((project) => project.id === projectId)
	const currentProjectName = currentProject?.title ?? 'Project'
	
	// sets projectId for Task context
	useEffect(() => {
		setActiveProjectId(projectId ?? '')

		return () => {
			setActiveProjectId('')
		}
	}, [projectId, setActiveProjectId])
	

	const handleGoBack = useCallback(() => {
		try {
			if (router.canGoBack()) {
			router.back()
			return
			}
			router.replace('/')
		} catch {
			router.replace('/')
		}
	}, [router]); // Add router as a dependency

	// Then update the useEffect dependency array:
	useEffect(() => {
		if (!currentProject && !deleting) {
			Alert.alert('Access Lost', 'This project is not accessible anymore. You may have been removed or the project may have been deleted.');
			handleGoBack();
		}
	}, [currentProject, handleGoBack, deleting]); // Add handleGoBack here

  	// Invite modal
  	const handleInvitePress = () => setInviteModalVisible(true)

  	const handleCloseInviteModal = () => {
		setInviteModalVisible(false)
		setInviteTarget('')
	};

	// See members modal
	const handleSeeMembersPress = () => setSeeMembersModalVisible(true)
	const handleCloseMembersModal = () => setSeeMembersModalVisible(false)



	const handleSendInvite = async () => {
		const trimmedTarget = inviteTarget.trim().toLowerCase()

		if (!trimmedTarget) {
			Alert.alert('Missing user', 'Please enter a valid email.')
			return
		}

		try {
			const receiverUser = await userService.getUserByEmail(trimmedTarget)

			if (!receiverUser) {
				Alert.alert('User not found', 'No registered user matches that email.')
				return
			}

			if (receiverUser.id === user.uid) {
				Alert.alert('Invalid invite', 'You cannot invite yourself.')
				return
			}

			if (!currentProject?.id) {
				Alert.alert('Project unavailable', 'Unable to find this project.')
				return
			}

			await sendInvite({
				senderId: user.uid,
				senderEmail: user.email,
				receiverId: receiverUser.id,
				projectId: currentProject.id,
				projectName: currentProjectName,
			})
			
		} catch (error) {
			Alert.alert('Invite failed', error.message)
			return
		}

		Toast.show({
			type: 'success',
			text1: 'Invite sent',
			text2: `Invitation sent to ${trimmedTarget}.`,
			position: 'top',
			visibilityTime: 1500,
			topOffset: 100,
		})

		handleCloseInviteModal()
	}

	const handleProjectDelete = async () => {
		try {
			setDeleting(true)
			await deleteProject(projectId)
			handleGoBack()
		}
		catch (error) {
			console.log('Delete Failed', error.message)
		}
	}

	// Column related modals
	const openCreateColumnModal = () => setCreateColumnModalVisible(true)
	const closeCreateColumnModal = () => {
		setCreateColumnModalVisible(false)
		setColumnData({ name: '' })
	}

	const [columnData, setColumnData] = useState({
		name: ''
	})

	const handleColumnChange = (field, value) => {
		setColumnData((prev) => ({ ...prev, [field]: value }))
	}

	const handleCreateColumn = async (columnData) => {
		try {
			await createColumn(columnData)
			closeCreateColumnModal()
		} catch (error) {
			Alert.alert('Column creation failed', error.message)
		}
	}

	// Column related handlers
	const handleKickMember = async (projectId, userId, userEmail) => {
		try {
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
						<ThemedIcon name="arrow-left"/>
					</Pressable>
				),

				headerRight: () => (
					<>
						<Pressable onPress={openCreateColumnModal} hitSlop={10} style={{
							width: 40,
							height: 40,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
							<MaterialCommunityIcons name="table-column-plus-after" size={24} color="black" />
						</Pressable>
						<Pressable onPress={handleSeeMembersPress} hitSlop={10} style={{
							width: 40,
							height: 40,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
							<ThemedIcon testID="see-members-icon" name="account-multiple" size={24}/>
						</Pressable>

						<OverflowMenu
							testID="project-overflow-menu"
							actions={[
								{
									id: 'invite-member',
									title: 'Invite member',
									icon: 'account-plus',
									onPress: () => handleInvitePress(),
								},
								{
									id: 'delete-project',
									title: 'Delete project',
									icon: 'delete',
									confirm: {
										title: 'Delete project',
										message: 'Are you sure you want to delete this project? All related data will be lost.',
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
				{
				columns.length === 0 ?
				<EmptyState
					title="No columns yet"
					subtitle="Create your first column to start organizing tasks in this project"
					iconName="view-column-outline"
				/> 

				: 

				<PagerView style={{ flex: 1 }} initialPage={0}>
					{columns.map((item) => (
					<View key={item.id} style={{ flex: 1, padding: 16 }} collapsable={false}>
						<Column
							projectId={projectId}
							projectName={currentProjectName}
							columnData={item} // Pass the entire column data instead of just the name
						/>
					</View>
					))}
				</PagerView>
				}

				<CreateColumnModal
					visible={createColumnModalVisible}
					onClose={closeCreateColumnModal}
					onCreate={handleCreateColumn}
					onChange={handleColumnChange}
					columnData={columnData}
				/>

				<InviteProjectModal
					visible={inviteModalVisible}
					value={inviteTarget}
					onChangeText={setInviteTarget}
					onClose={handleCloseInviteModal}
					onInvite={handleSendInvite}
					projectName={currentProjectName}
				/>

				<SeeMembersModal
					visible={seeMembersModalVisible}
					getProjectUsers={() => projectService.getProjectUsers(projectId)}
					onClose={handleCloseMembersModal}
					onKickMember={(userId, userEmail) => handleKickMember(projectId, userId, userEmail)}
				/>
			</SafeAreaView>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	btn: {
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
