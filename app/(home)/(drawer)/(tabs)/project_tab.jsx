import React, { useState } from 'react';
import { Alert, View, StyleSheet, useColorScheme, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useProject } from '../../../../hooks/useProject';
import ThemedText from '../../../../components/ThemedText';
import ThemedProject from '../../../../components/ThemedProject';
import ThemedButton from '../../../../components/ThemedButton';
import CreateProjectModal from '../../../../components/CreateProjectModal';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const { projects, createProject, isLoadingProjects } = useProject();


    const [ project, setProject ] = React.useState({
        title: '',
        description: '',
    });

    const handleProjectChange = (field, value) => {
        setProject((prev) => ({ ...prev, [field]: value }))
    };

    // Project modal
    const openProjectModal = () => setProjectModalVisible(true);

    const closeProjectModal = () => {
        setProjectModalVisible(false);
        setProject({
            title: '',
            description: '',
        });
    };

    const handleCreateProject = async (project) => {
        try {
            await createProject(project);
            closeProjectModal();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const borderColors = ["#4694fb", "#a950fa", "#d75bfb", "#f8d768"];
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="folder-open"
                size={64}
                color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
            />
            <ThemedText style={styles.emptyTitle}>
                No projects
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                When you create a project or accept an invite to one, it will appear here
            </ThemedText>
        </View>
    )

    return (
        <View style={[styles.container, { backgroundColor: theme.background }] }>
            {
                isLoadingProjects ?

                <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 15, fontSize: 16}}/>

                :

                <FlatList
                data={projects}
                style={styles.list}
                contentContainerStyle={[
                    styles.list,
                    (!projects || projects.length === 0) && styles.listEmpty
                ]}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                ListEmptyComponent={<EmptyState />}
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

            <CreateProjectModal
                visible={projectModalVisible}
                onClose={closeProjectModal}
                onCreate={handleCreateProject}
                project={project}
                onChange={handleProjectChange}
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
    listEmpty: {
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
        marginBottom: 0,
            zIndex: 10,
            elevation: 4,
    },

  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 20,
    }
})