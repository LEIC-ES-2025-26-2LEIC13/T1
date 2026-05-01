import { act, use, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, Text, FlatList, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import InviteWorkspaceModal from '../components/InviteWorkspaceModal';
import ThemedButton from "../components/ThemedButton";
import ThemedText from "../components/ThemedText";
import Task from "../components/ThemedTask";
import useProject from '../hooks/useProject';
import { useAuth } from '../hooks/useAuth';
import { useInvite } from '../hooks/useInvite';
import  useColumn  from '../hooks/useColumn'
import { userService } from '../api/userService';
import { projectService } from '../api/projectService';
import OverflowMenu from '../components/OverflowMenu';
import SeeMembersModal from '../components/SeeMembersModal';
import PagerView from 'react-native-pager-view';
import Column from './column';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CreateColumnModal from '../components/CreateColumnModal';

export default function ProjectScreen() {
  	const router = useRouter()
	const params = useLocalSearchParams() // Routing parameters of the current screen
	// For example: /project?projectId=abc -> params.projectId will be abc

	const scheme = useColorScheme()
	const palette = Colors[scheme] ?? Colors.light

  	const { projects, deleteProject } = useProject() // user projects

	const { columns, setActiveProjectId, isLoadingColumns, createColumn, setColumns} = useColumn()
	const [ createColumnModalVisible, setCreateColumnModalVisible ] = useState(false)

  	const { user } = useAuth()

  	const { sendInvite } = useInvite()
	const [ inviteTarget, setInviteTarget ] = useState('')
	
	const [ inviteModalVisible, setInviteModalVisible ] = useState(false)
	const [ seeMembersModalVisible, setSeeMembersModalVisible ] = useState(false)

	// Search for current project in the user's projects
	const projectId = params.projectId
	const currentProject = projects.find((project) => project.id === projectId)
	const currentProjectName = currentProject?.title ?? 'Project'

	const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';
	
	// sets projectId for Task context
	useEffect(() => {
		setActiveProjectId(projectId ?? '')

		return () => {
			setActiveProjectId('')
		}
	}, [projectId, setActiveProjectId])
	

	const handleGoBack = () => {
		try {
		if (router.canGoBack()) {
			router.back()
			return
		}

		router.replace('/')
		} catch {
		router.replace('/')
		}
  	};

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
				projectName: currentProject.title,
			})

			handleCloseInviteModal()
			Toast.show({
				type: 'success',
				text1: 'Invite sent',
				text2: `Invitation sent to ${trimmedTarget}.`,
				position: 'top',
				visibilityTime: 1500,
				topOffset: 100,
			})
		} catch (error) {
			Alert.alert('Invalid invite', error.message)
		}
	}

	const handleProjectDelete = async () => {
		try {
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

	// Column related handlers
	const handleCreateColumn = async (columnData) => {
		try {
			await createColumn(columnData)
			closeCreateColumnModal()
		} catch (error) {
			Alert.alert('Column creation failed', error.message)
		}
	}

	const handleKickMember = async (projectId, userId, userEmail) => {
		try { // maybe place this logic inside the context
			await projectService.kickMember(projectId, userId)

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

	const EmptyColumnsState = () => (
		<View style={styles.emptyContainer}>
			<MaterialCommunityIcons
			name="view-column-outline"
			size={64}
			color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
			/>

			<ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
			No columns yet
			</ThemedText>

			<ThemedText
			style={[
				styles.emptySubtitle,
				{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }
			]}
			> Create your first column to start organizing tasks in this project
			</ThemedText>
		</View>
	)


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
				{columns.length === 0 ? <EmptyColumnsState /> : null}
				{ // Had to add a special case for 1 column because the pager crashed with only 1 page
				columns.length === 1 ? 
					<View key={columns[0].id} style={{ flex: 1, padding: 16 }} collapsable={false}>
						<Column
							projectId={projectId}
							columnData={columns[0]} // Pass the entire column data instead of just the name
						/>
					</View> 
					
					: 

					<PagerView style={{ flex: 1 }} initialPage={0}>
						{columns.map((item) => (
						<View key={item.id} style={{ flex: 1, padding: 16 }} collapsable={false}>
							<Column
								projectId={projectId}
								columnData={item} // Pass the entire column data instead of just the name
							/>
						</View>
						))}
					</PagerView>}

				<CreateColumnModal
					visible={createColumnModalVisible}
					onClose={closeCreateColumnModal}
					onCreate={handleCreateColumn}
					onChange={handleColumnChange}
					columnData={columnData}
				/>

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
			</SafeAreaView>
		</>
	)
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
  },
  emptyContainer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingHorizontal: 24,
},

	emptyTitle: {
	fontSize: 20,
	fontWeight: '600',
	marginTop: 10,
	},

	emptySubtitle: {
	fontSize: 14,
	textAlign: 'center',
	maxWidth: 260,
	lineHeight: 20,
	marginTop: 6,
	},

	emptyAction: {
	marginTop: 18,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	paddingHorizontal: 16,
	paddingVertical: 12,
	borderRadius: 999,
	gap: 8,
	},

	emptyActionText: {
	color: '#fff',
	fontSize: 14,
	fontWeight: '600',
	},
});
