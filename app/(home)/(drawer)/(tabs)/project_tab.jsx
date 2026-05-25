import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ProjectColors } from '../../../../constants/Colors';
import { useProject } from '../../../../hooks/useProject';
import ThemedText from '../../../../components/ThemedText';
import ThemedProject from '../../../../components/ThemedProject';
import ThemedButton from '../../../../components/ThemedButton';
import CreateProjectModal from '../../../../components/CreateProjectModal';
import EmptyState from '../../../../components/EmptyState';
import ThemedAlert, { ALERT_TYPES } from '../../../../components/ThemedAlert';
import ThemedView from '../../../../components/ThemedView';
import ThemedIcon from '../../../../components/ThemedIcon';
import LoadingScreen from '../../../../components/LoadingScreen'
import ReorderableList, { reorderItems, useReorderableDrag } from 'react-native-reorderable-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Projects = () => {

    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const { projects, setProjects, createProject, reorderProjects, isLoadingProjects } = useProject();

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = useCallback((type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    }, []);

    const [ project, setProject ] = React.useState({
        title: '',
        description: '',
    });

    const DraggableProject = ({ item, borderColor }) => {
        const drag = useReorderableDrag();

        return (
            <ThemedProject
                projectId={item.id}
                name={item.title}
                description={item.description}
                borderColor={borderColor}
                onLongPress={drag}
            />
        )
    }

    const handleReorder = useCallback(({ from, to }) => {
        setProjects((prevProjects) => {
            const reorderedProjects = reorderItems(prevProjects, from, to)

            reorderProjects(reorderedProjects).catch((error) => {
                showAlert(ALERT_TYPES.ERROR, 'Reorder Failed', error.message)
            })

            return reorderedProjects
        })
    }, [reorderProjects, setProjects, showAlert])

    const renderItem = useCallback(({ item, index }) => {
        const colorIndex = index % ProjectColors.length

        return (
            <DraggableProject
                item={item}
                borderColor={ProjectColors[colorIndex]}
            />
        )
    }, []);

    const handleProjectChange = (field, value) => {
        setProject((prev) => ({ ...prev, [field]: value }))
    };

    // Project modal
    const openProjectModal = () => setProjectModalVisible(true);

    const closeProjectModal = () => {
        setProjectModalVisible(false)
        setProject({
            title: '',
            description: '',
        });
    };

    const handleCreateProject = async (project) => {
        try {
            await createProject(project)
            closeProjectModal()
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, 'Create Project Failed', error.message)
        }
    };


    return (
        <ThemedView style={styles.container}>
            {
                isLoadingProjects ?

                <LoadingScreen loadingText="Loading Projects..."/>

                :
                <>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <ReorderableList
                            data={projects}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            onReorder={handleReorder}
                            contentContainerStyle={[
                                styles.list,
                                (projects.length === 0) && styles.listEmpty
                            ]}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<EmptyState
                                title="No projects"
                                subtitle="When you create a project or accept an invite to one, it will appear here"
                                iconName="folder-open"
                            />}
                        />
                    </GestureHandlerRootView>
                
                
                    <ThemedButton
                        testID="open-create-project-modal-button"
                        style={{ marginBottom: 16 }}
                        disabled={isLoadingProjects}
                        onPress={openProjectModal}>
                        <ThemedIcon name="plus" onPrimary style={{ marginRight: 6 }} /> 
                        <ThemedText bold onPrimary>Create Project</ThemedText>
                    </ThemedButton>

                    <CreateProjectModal
                        visible={projectModalVisible}
                        onClose={closeProjectModal}
                        onCreate={handleCreateProject}
                        project={project}
                        onChange={handleProjectChange}
                    />

                    <ThemedAlert
                        visible={alertVisible}
                        alert={alert}
                        onConfirm={() => setAlertVisible(false)}
                    />
                </>
            }

        </ThemedView>
    );
}

export default Projects;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },

    list: {
        paddingVertical: 16,
    },

    listEmpty: {
        flex: 1,
        marginTop: 50
    }
})