import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, FlatList } from 'react-native';

import ThemedText from '../../../../components/ThemedText';
import ThemedProject from '../../../../components/ThemedProject';
import ThemedButton from '../../../../components/ThemedButton';
import ProjectModal from '../../../../components/ProjectModal';
import ThemedView from '../../../../components/ThemedView';

import useProject from '../../../../hooks/useProject';
import { normalizeProjectData } from '../../../../model/Project';


const Projects = () => {

    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const { projects, isLoadingProjects, createProject } = useProject();

    const openProjectModal = () => setProjectModalVisible(true);

    const closeProjectModal = () => {
        setProjectModalVisible(false);
        setProjectTitle('');
        setProjectDescription('');
    };

    const handleCreateProject = async (projectData) => {
        const normalizedProjectData = normalizeProjectData({
            ...projectData,
        });


        await createProject(normalizedProjectData);
        closeProjectModal();
    };

    const borderColors = ["#4694fb", "#a950fa", "#d75bfb", "#f8d768"];

    return (
        <ThemedView style={ styles.container }>
            {
            isLoadingProjects? 
            <ActivityIndicator size="large" color="#000" />
            
            :

            <FlatList
                data={projects ?? []}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item, index) => `${item.title}-${index}`}

                ListEmptyComponent={
                    <ThemedText style={styles.blankText}>No projects yet!</ThemedText>
                }

                renderItem={({ item, index }) => (
                    <ThemedProject
                        projectId={item.id}
                        name={item.title}
                        description={item.description}
                        borderColor={borderColors[index % borderColors.length]}
                    />
                )}
            />
            }
            
            <ThemedButton
                style={styles.btn}
                disabled={isLoadingProjects}
                onPress={openProjectModal}>
                <ThemedText style={[styles.btnText ,{ marginRight: 20 }]}>+</ThemedText>
                <ThemedText style={styles.btnText}>Create Project</ThemedText>
            </ThemedButton>

            <ProjectModal
                visible={projectModalVisible}
                onClose={closeProjectModal}
                onCreate={handleCreateProject}
                titleValue={projectTitle}
                onTitleChangeText={setProjectTitle}
                descriptionValue={projectDescription}
                onDescriptionChangeText={setProjectDescription}
            />

        </ThemedView>
    );
}

export default Projects;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingBottom: 110,
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
        marginBottom: 0,
        zIndex: 10,
        elevation: 4,
    },

    btnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    blankText: {
        textAlign: 'center',
        marginTop: 20,

        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.7
    }
})