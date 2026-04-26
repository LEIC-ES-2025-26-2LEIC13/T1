The tools used were Claude Sonnet 4.6 Thinking model from Perplexity Pro and also AI chat from Github inside VScode. The first one was mostly used to ask questions and clarify certain implementation/design ideas and the second was mostly used to ask questions with context of the project and sometimes write some of the code for us.
All code that is generated is reviewed before being fully integrated, to minimize errors and guarantee that the codebase is understood by all team members, facilitating the implementation of new features while maintaining the code modular, sound and with the desired quality. Below are two examples of usage of AI tools when asking for improvements in the UI design.

**Prompt for improving the Login Page:**

- Sent the previous code that already existed and asked for the follwing: **Update the code with good gradient colors (around blueish)**
-  In this case, the tool added linear gradient from the expo-linear-gradient dependency and used a color close to the others already used (for example based on the current button existing colors).
- **Output:**

```` javascript 
import { StyleSheet, Text, Alert, Keyboard, ScrollView, View, useColorScheme } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Please enter both email and password.")
            return
        }

        try {
            await login(email, password)
        } catch (error) {
            let errorMessage

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "The email address is invalid."
                    break
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled."
                    break
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email. Please register first."
                    break
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Incorrect email or password. Please try again."
                    break
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed login attempts. Please try again later."
                    break
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection."
                    break
                default:
                    errorMessage = error.message
            }

            Alert.alert("Login Error", errorMessage)
        }
    }

    return (
        <ThemedView style={styles.container}>

            {/* Full-screen background gradient */}
            <LinearGradient
                colors={['#0f2f5e', '#1a5fa8', '#3b8fd4']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* App branding in the upper area */}
            <View style={styles.brandingContainer}>
                <Text style={styles.appName}>LEICo</Text>
                <Text style={styles.slogan}>From students to students</Text>
            </View>

            {/* Gradient fading into the card */}
            <LinearGradient
                colors={['transparent', theme.navBackground]}
                style={styles.cardGradient}
            />

            {/* Bottom card sheet */}
            <View
                pointerEvents="none"
                style={[
                    styles.bottomSheet,
                    { backgroundColor: theme.navBackground }
                ]}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={false}
                onTouchStart={Keyboard.dismiss}
            >
                <ThemedText style={styles.subtitle}>Login to continue</ThemedText>

                <Spacer />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="login-email-input"
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    editable={!isLoading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="login-password-input"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    editable={!isLoading}
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                />

                <Spacer />

                <ThemedButton
                    testID="login-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={{ width: '80%', alignItems: 'center' }}
                >
                    <Text style={{ color: "#ffffff" }}>Login</Text>
                </ThemedButton>

                <Spacer />

                <Text style={{ color: '#aaa' }}>Don't have an account? </Text>
                <Spacer height={10} />
                <ThemedButton
                    onPress={() => router.push('/(auth)/register')}
                    disabled={isLoading}
                    style={{ paddingVertical: 8 }}
                >
                    <Text style={{ color: "#ffffff" }}>Register here</Text>
                </ThemedButton>
            </ScrollView>
        </ThemedView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    cardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
    },

    scrollContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 100,
    },

    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden',
        elevation: 4,
    },

    title: {
        textAlign: 'center',
        fontSize: 30,
        marginBottom: 5
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 20
    },

    brandingContainer: {
        position: 'absolute',
        top: '18%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    appName: {
        fontSize: 52,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 1.5,
    },

    slogan: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 6,
        letterSpacing: 0.5,
    },
})
````

- Sent the previous code that already existed and asked for the follwing: **I want a more polished and professional look to this page**
-  In this case, the tool focused on improving each projects appearance inside the My Projects section of the app and also added an empty state, in case no projects exist for the current user.
- **Output:**

```` javascript 
import React from 'react';
import { Alert, View, StyleSheet, useColorScheme, FlatList, Text } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import ThemedText from '../../../../components/ThemedText';
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

            {/* Header */}
            <View style={[styles.header, {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Projects</Text>
                    <Text style={[styles.headerSubtitle, {
                        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'
                    }]}>
                        {projects?.length ?? 0} {projects?.length === 1 ? 'project' : 'projects'}
                    </Text>
                </View>
            </View>

            {/* List */}
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

            {/* FAB */}
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

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
        fontWeight: '400',
    },

    // List
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

    // Empty state
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

    // FAB
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

````
