import React from 'react';
import { View, StyleSheet, useColorScheme, FlatList } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import ThemedText from '../../../../components/ThemedText';
import ThemedProject from '../../../../components/ThemedProject';
import ThemedButton from '../../../../components/ThemedButton';
import ProjectModal from '../../../../components/ProjectModal';
import useProject from '../../../../hooks/useProject';
import { normalizeProjectData } from '../../../../model/Project';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const [projectModalVisible, setProjectModalVisible] = React.useState(false);
    const [projectTitle, setProjectTitle] = React.useState('');
    const [projectDescription, setProjectDescription] = React.useState('');
    const { projects, createProject } = useProject();

    const openProjectModal = () => setProjectModalVisible(true);

    const closeProjectModal = () => {
        setProjectModalVisible(false);
        setProjectTitle('');
        setProjectDescription('');
    };

    const handleCreateProject = async (projectData) => {
        const normalizedProjectData = normalizeProjectData(projectData);
            await createProject(normalizedProjectData);
            closeProjectModal();
    };

    const borderColors = ["#4694fb", "#a950fa", "#d75bfb", "#f8d768"];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }] }>
            <FlatList
                data={projects ?? []}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                renderItem={({ item, index }) => (
                    <ThemedProject
                        name={item.title}
                        description={item.description}
                        borderColor={borderColors[index % borderColors.length]}
                        href="/project"
                    />
                )}
            />
            <ThemedButton
                style={styles.btn}
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

        </View>
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
  }
})