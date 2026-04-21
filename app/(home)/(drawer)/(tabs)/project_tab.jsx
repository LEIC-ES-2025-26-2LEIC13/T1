import React from 'react';
import { Alert, View, StyleSheet, useColorScheme, FlatList, Text } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import ThemedProject from '../../../../components/ThemedProject';
import ThemedButton from '../../../../components/ThemedButton';
import ProjectModal from '../../../../components/ProjectModal';
import useProject from '../../../../hooks/useProject';
import { Ionicons } from '@expo/vector-icons';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

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
        try {
            await createProject(projectData);
            closeProjectModal();
        } catch (error) {
            Alert.alert('Error', error.message || 'Could not create project');
        }
    };

    const borderColors = ["#4694fb", "#a950fa", "#d75bfb", "#f8d768"];

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="folder-open-outline"
                size={64}
                color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No projects yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                Tap "New Project" below to get started
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <FlatList
                data={projects ?? []}
                style={styles.list}
                contentContainerStyle={[
                    styles.listContent,
                    (!projects || projects.length === 0) && styles.listContentEmpty
                ]}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                showsVerticalScrollIndicator={false}
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

            <ThemedButton
                style={styles.fab}
                onPress={openProjectModal}
            >
                <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.fabText}>New Project</Text>
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
};

export default Projects;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 110,
    },
    listContentEmpty: {
        flex: 1,
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
        maxWidth: 220,
    },

    fab: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 50,
        width: '85%',
        elevation: 6,
        shadowColor: '#1a5fa8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        zIndex: 10,
    },
    fabText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});