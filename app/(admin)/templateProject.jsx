import { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ThemedText from "../../components/ThemedText";
import OverflowMenu from '../../components/OverflowMenu';
import CreateColumnModal from '../../components/CreateColumnModal';
import ThemedIcon from '../../components/ThemedIcon';
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert';
import SafeAreaPage from '../../components/SafeAreaPage';
import AnimatedPressable from '../../components/AnimatedPressable';
import EditProjectModal from "../../components/EditProjectModal";
import { useTemplate } from '../../hooks/useTemplate';
import { templateService } from '../../api/templateService';
import TemplateColumns from './templateColumns';

export default function ProjectScreen() {
  	const router = useRouter()
	const params = useLocalSearchParams()

  	const { templates, deleteTemplate, columns, setActiveTemplateId, createColumn } = useTemplate();
	const [deleting, setDeleting] = useState(false) 
	const [leaving, setLeaving] = useState(false)

	const [ createColumnModalVisible, setCreateColumnModalVisible ] = useState(false)

	const [ editProjectModalVisible, setEditProjectModalVisible ] = useState(false)
	const [ editProjectData, setEditProjectData ] = useState({ title: '', description: '' })

	const templateId = params.templateId
	const currentTemplate = templates.find((template) => template.id === templateId)
	const currentTemplateName = currentTemplate?.title ?? 'Template'

	// Alert
	const [alertVisible, setAlertVisible] = useState(false);
	const [alert, setAlert] = useState({ type: '', title: '', message: '', onConfirm: null });

	const showAlert = (type, title, message, onConfirm = null) => {
		setAlert({ type, title, message, onConfirm });
		setAlertVisible(true);
	};
	
	useEffect(() => {
		setActiveTemplateId(templateId ?? '')

		return () => {
			setActiveTemplateId('')
		}
	}, [templateId , setActiveTemplateId])


	useEffect(() => {
		if (!currentTemplate && !deleting && !leaving) {
			showAlert(ALERT_TYPES.INFO, "Access Lost", "This project is not accessible anymore. You may have been removed or the project may have been deleted.", () => {
				handleGoBack();
			});
		}
	}, [currentTemplate, handleGoBack, deleting, leaving]);


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
	}, [router]);

	const handleEditProjectPress = () => {
		setEditProjectData({
			title: currentTemplate.title || '',
			description: currentTemplate.description || ''
		})
		setEditProjectModalVisible(true)
	}

	const handleCloseEditProjectModal = () => setEditProjectModalVisible(false)

	const handleEditProjectChange = (field, value) => {
		setEditProjectData((prev) => ({ ...prev, [field]: value }))
	}

	const handleSaveProject = async (projectData) => {
		try {
			await templateService.updateTemplate(templateId, projectData)
			showAlert(ALERT_TYPES.SUCCESS, "Success", "Template updated successfully.")
		}
		catch (error) {
			showAlert(ALERT_TYPES.ERROR, "Update Failed", error.message)
		}
		setEditProjectModalVisible(false)
	}

	const handleTemplateDelete = async () => {
		try {
			setDeleting(true) // prevents the "Access Lost" alert from showing
			await deleteTemplate(templateId)
			showAlert(ALERT_TYPES.SUCCESS, "Success", "Successfully deleted the template.", () => {
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

  	return (
		<>
			<Stack.Screen
				options={{

					headerTitle: () => (
						<ThemedText title bold style={{ fontSize: 20 }}>
							{currentTemplateName}
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

							<OverflowMenu
								testID="project-overflow-menu"
								actions={[
									{
										testID: "edit-project-action",
										id: 'edit-project',
										title: 'Edit Template',
										icon: 'cog-outline',
										onPress: () => handleEditProjectPress(),
									},
									{
										testID: "delete-project-action",
										id: 'delete-project',
										title: 'Delete Template',
										icon: 'delete',
										confirm: {
											title: 'Delete Template',
											message: 'Are you sure you want to delete this template? This template will be permanently deleted for all users of the app.',
										},
										destructive: true,
										onPress: () => handleTemplateDelete(),
									}
								]}
							/>
						</>
					)				
				}}
			/>

			<SafeAreaPage style={styles.container}>
				
				<TemplateColumns
					columns={columns}
					templateId={templateId}
					currentTemplateName={currentTemplateName}
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
