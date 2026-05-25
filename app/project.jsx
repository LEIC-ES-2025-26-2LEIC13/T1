import { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
import CreateColumnModal from '../components/CreateColumnModal';
import ThemedIcon from '../components/ThemedIcon';
import ThemedAlert, { ALERT_TYPES } from '../components/ThemedAlert';
import SafeAreaPage from '../components/SafeAreaPage';
import Columns from '../components/Columns';
import AnimatedPressable from '../components/AnimatedPressable';
import EditProjectModal from "../components/EditProjectModal";

export default function ProjectScreen() {
  	const router = useRouter()
	const params = useLocalSearchParams() // Routing parameters of the current screen
	// For example: /project?projectId=abc -> params.projectId will be abc


  	const { projects, deleteProject, kickMember } = useProject(); // user 
	const [deleting, setDeleting] = useState(false) 
	const [leaving, setLeaving] = useState(false)
  	const { user } = useAuth();

	const { columns, setActiveProjectId, createColumn} = useColumn()
	const [ createColumnModalVisible, setCreateColumnModalVisible ] = useState(false)

  	const { sendInvite } = useInvite()
	const [ inviteTarget, setInviteTarget ] = useState('')

	const [ editProjectModalVisible, setEditProjectModalVisible ] = useState(false)
	const [ editProjectData, setEditProjectData ] = useState({ title: '', description: '' })
	const [ inviteModalVisible, setInviteModalVisible ] = useState(false)
	const [ seeMembersModalVisible, setSeeMembersModalVisible ] = useState(false)
	const [ isProjectFromTemplate, setIsProjectFromTemplate ] = useState(false)

	// Search for current project in the user's projects
	const projectId = params.projectId
	const currentProject = projects.find((project) => project.id === projectId)
	const currentProjectName = currentProject?.title ?? 'Project'

	// Alert
	const [alertVisible, setAlertVisible] = useState(false);
	const [alert, setAlert] = useState({ type: '', title: '', message: '', onConfirm: null });

	const showAlert = (type, title, message, onConfirm = null) => { // function to call when an alert needs to be shown
		setAlert({ type, title, message, onConfirm });
		setAlertVisible(true);
	};
	
	// sets projectId for Task context
	useEffect(() => {
		const fetchTemplateStatus = async () => {
			setActiveProjectId(projectId ?? '')

			if (projectId) {
				try {
					const isFromTemplate = await projectService.isProjectFromTemplate(projectId)
					setIsProjectFromTemplate(isFromTemplate)
				} catch (error) {
					showAlert(ALERT_TYPES.ERROR, "Failed to determine if the project is from a template", error.message)
				}
			}
		}

		fetchTemplateStatus()

		return () => {
			setActiveProjectId('')
		}
	}, [projectId, setActiveProjectId])


	useEffect(() => {
		if (!currentProject && !deleting && !leaving) {
			showAlert(ALERT_TYPES.INFO, "Access Lost", "This project is not accessible anymore. You may have been removed or the project may have been deleted.", () => {
				handleGoBack();
			});
		}
	}, [currentProject, handleGoBack, deleting, leaving]);


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

	// Edit Project modal
	const handleEditProjectPress = () => {
		setEditProjectData({
			title: currentProject.title || '',
			description: currentProject.description || ''
		})
		setEditProjectModalVisible(true)
	}

	const handleCloseEditProjectModal = () => setEditProjectModalVisible(false)

	const handleEditProjectChange = (field, value) => {
		setEditProjectData((prev) => ({ ...prev, [field]: value }))
	}

	const handleSaveProject = async (projectData) => {
		try {
			await projectService.updateProject(projectId, projectData)
			showAlert(ALERT_TYPES.SUCCESS, "Success", "Project updated successfully.")
		}
		catch (error) {
			showAlert(ALERT_TYPES.ERROR, "Update Failed", error.message)
		}
		setEditProjectModalVisible(false)
	}

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
			showAlert(ALERT_TYPES.ERROR, "Missing user", "Please enter a valid email.")
			return
		}

		try {
			const receiverUser = await userService.getUserByEmail(trimmedTarget)

			if (!receiverUser) {
				showAlert(ALERT_TYPES.ERROR, "User not found", "No registered user matches that email.")
				return
			}

			if (receiverUser.id === user.uid) {
				showAlert(ALERT_TYPES.ERROR, "Invalid invite", "You cannot invite yourself.")
				return
			}

			if (!currentProject?.id) {
				showAlert(ALERT_TYPES.ERROR, "Project unavailable", "Unable to find this project.")
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
			showAlert(ALERT_TYPES.ERROR, "Invite failed", error.message)
			return
		}

		Toast.show({
			type: 'default',
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
			setDeleting(true) // prevents the "Access Lost" alert from showing
			await deleteProject(projectId)
			showAlert(ALERT_TYPES.SUCCESS, "Success", "Successfully deleted the project.", () => {
				handleGoBack()
			})
		}
		catch (error) {
			setDeleting(false)
			showAlert(ALERT_TYPES.ERROR, "Deletion Failed", error.message)
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
			showAlert(ALERT_TYPES.ERROR, "Column Creation Failed", error.message)
		}
	}

	// Column related handlers
	const handleKickMember = async (projectId, userId, userEmail) => {
		try {
			if (userId === user.uid) {
				setLeaving(true)
			}

			// eu acho que este kickMember está a fazer com o utilizador saia do projeto.
			await kickMember(projectId, userId)

			let alertMessage
			let onAlertConfirm = null
			
			if (userId === user.uid) {
				alertMessage = "Successfully left the project."
				onAlertConfirm = async () => {
					handleGoBack() // navigate away when leaving project

					// To prevent unaccessible projects (leaks)
					if (await projectService.projectHasNoMembers(projectId)) {
						await projectService.deleteProject(projectId)
					}
				}

			} else {
				alertMessage = `Successfully kicked ${userEmail}.`
			}

			showAlert(ALERT_TYPES.SUCCESS, "Success", alertMessage, onAlertConfirm)
		}
		catch (error) {
			if (userId === user.uid) {
				setLeaving(false)
			}
			showAlert(ALERT_TYPES.ERROR, "Kick Operation Failed", error.message)
		}
    }

	let actions
	if (isProjectFromTemplate) {
		actions = [
			{	
				testID: "invite-member-action",
				id: 'invite-member',
				title: 'Invite member',
				icon: 'account-plus',
				onPress: () => handleInvitePress(),
			},
			{
				testID: "edit-project-action",
				id: 'edit-project',
				title: 'Edit Project',
				icon: 'cog-outline',
				onPress: () => handleEditProjectPress(),
			},
			{
				testID: "suggest-improvements-action",
				id: 'suggest-improvements',
				title: 'Suggest improvements',
				icon: 'lightbulb',
				onPress: () => showAlert(ALERT_TYPES.INFO, 'Suggest improvements', 'This feature is not implemented yet.'),
			},
			{
				testID: "delete-project-action",
				id: 'delete-project',
				title: 'Delete project',
				icon: 'delete',
				confirm: {
					title: 'Delete Project',
					message: 'Are you sure you want to delete this project? All related data will be lost.',
				},
				destructive: true, // If we place a string of text that is not null, 
				// it will be marked as a destructive action
				onPress: () => handleProjectDelete(),
			}
		]

	} else {
		actions = [
			{	
				testID: "invite-member-action",
				id: 'invite-member',
				title: 'Invite member',
				icon: 'account-plus',
				onPress: () => handleInvitePress(),
			},
			{
				testID: "edit-project-action",
				id: 'edit-project',
				title: 'Edit Project',
				icon: 'cog-outline',
				onPress: () => handleEditProjectPress(),
			},
			{
				testID: "delete-project-action",
				id: 'delete-project',
				title: 'Delete project',
				icon: 'delete',
				confirm: {
					title: 'Delete Project',
					message: 'Are you sure you want to delete this project? All related data will be lost.',
				},
				destructive: true, // If we place a string of text that is not null, 
				// it will be marked as a destructive action
				onPress: () => handleProjectDelete(),
			}
		]
	}

  	return (
		<>
			<Stack.Screen
				options={{

					headerTitle: () => (
						<ThemedText title bold style={{ fontSize: 20 }}>
							{currentProjectName}
						</ThemedText>
					),

					headerLeft: () => (
						<AnimatedPressable onPress={handleGoBack} style={{ paddingLeft: 5, paddingRight: 10 }}>
							<ThemedIcon testID="project-arrow-back" name="arrow-left"/>
						</AnimatedPressable>
					),

					headerRight: () => (
						<>
							<AnimatedPressable onPress={openCreateColumnModal} style={{ paddingHorizontal: 5 }}>
								<ThemedIcon testID="create-column-icon" name="table-column-plus-after" />
							</AnimatedPressable>
							<AnimatedPressable onPress={handleSeeMembersPress} style={{ paddingHorizontal: 12 }}>
								<ThemedIcon testID="see-members-icon" name="account-multiple"/>
							</AnimatedPressable>

							<OverflowMenu
								testID="project-overflow-menu"
								actions={actions}
							/>
						</>
					)				
				}}
			/>



			<SafeAreaPage style={styles.container}>
				
				<Columns
					columns={columns}
					projectId={projectId}
					currentProjectName={currentProjectName}
					openCreateColumnModal={openCreateColumnModal}
				/>

				<CreateColumnModal
					visible={createColumnModalVisible}
					onClose={closeCreateColumnModal}
					onCreate={handleCreateColumn}
					onChange={handleColumnChange}
					columnData={columnData}
				/>

				<EditProjectModal
					visible={editProjectModalVisible}
					onClose={handleCloseEditProjectModal}
					project={editProjectData}
					onChange={handleEditProjectChange}
					onSave={handleSaveProject}
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

				<ThemedAlert
					visible={alertVisible} 
					alert={alert} 
					onConfirm={() => {
						setAlertVisible(false);
						if (alert.onConfirm) {
							alert.onConfirm();
						}
					}} 
           	 	/>
				
			</SafeAreaPage>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
