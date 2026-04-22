import React from 'react';
import {Alert, Pressable, StyleSheet, useColorScheme, Text, View} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import InviteWorkspaceModal from '../components/InviteWorkspaceModal';
import TaskModal from '../components/CreateTaskModal';
import ThemedButton from "../components/ThemedButton";
import ThemedText from "../components/ThemedText";
import Task from "../components/Task";
import useProject from '../hooks/useProject';
import { useUser } from '../hooks/useUser';
import { useUsers } from '../hooks/useUsers';
import { useInvite } from '../hooks/useInvite';
import { useTask } from '../hooks/useTask';

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Routing parameters of the current screen
  // For example: /project?projectId=abc -> params.projectId will be abc
  const scheme = useColorScheme();
  const palette = Colors[scheme] ?? Colors.light;
  const { projects } = useProject(); // user projects
  const { user } = useUser();
  const { getUserByEmail } = useUsers();
  const { sendInvite } = useInvite();

  const [ taskName, setTaskName] = React.useState('');
  const [ taskDetail, setTaskDetail ] = React.useState('');
  const [ taskLabel, setTaskLabel ] = React.useState('');
  const [ taskModalVisible, setTaskModalVisible ] = React.useState(false);
  const { tasks, createTask } = useTask(params.projectId);

  const [inviteModalVisible, setInviteModalVisible] = React.useState(false);
  const [inviteTarget, setInviteTarget] = React.useState('');

  // Search for current project in the user's projects
  const projectId = params.projectId;
  const currentProject = projects.find((project) => project.id === projectId);
  const currentProjectName = currentProject.title;

  const openTaskModal = () => setTaskModalVisible(true);

  const closeTaskModal = () => {
    setTaskModalVisible(false);
    setTaskName('');
    setTaskDetail('');
  };

  const handleCreateTask = async (taskData) => {
    try{
      await createTask(taskData, projectId);
      closeTaskModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleInvitePress = () => {
    setInviteModalVisible(true);
  };

  const handleCloseModal = () => {
    setInviteModalVisible(false);
    setInviteTarget('');
  };

  const handleGoBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace('/');
    } catch {
      router.replace('/');
    }
  };

  const handleSendInvite = async () => {
    const trimmedTarget = inviteTarget.trim().toLowerCase();

    if (!trimmedTarget) {
      Alert.alert('Missing user', 'Please enter a valid email.');
      return;
    }

    try {
      const receiverUser = await getUserByEmail(trimmedTarget);

      if (!receiverUser) {
        Alert.alert('User not found', 'No registered user matches that email.');
        return;
      }

      if (receiverUser.id === user.uid) {
        Alert.alert('Invalid invite', 'You cannot invite yourself.');
        return;
      }

      await sendInvite({
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: receiverUser.id,
        projectId: currentProject.id,
        projectName: currentProject.title,
      });

      handleCloseModal();
      Toast.show({
        type: 'success',
        text1: 'Invite sent',
        text2: `Invitation sent to ${trimmedTarget}.`,
        position: 'top',
        visibilityTime: 1500,
        topOffset: 100,
      });
      } catch (error) {
        Alert.alert('Invalid invite', error.message);
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
              <Ionicons name="arrow-back" size={24} color={palette.title} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleInvitePress} hitSlop={10} style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="person-add" size={24} color={palette.title} />
            </Pressable>
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
        <InviteWorkspaceModal
          visible={inviteModalVisible}
          value={inviteTarget}
          onChangeText={setInviteTarget}
          onClose={handleCloseModal}
          onInvite={handleSendInvite}
          workspaceName={currentProjectName}
        />
        
        <FlatList
          data={tasks ?? []}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={({ item }) => (
              <Task
                  name={item.name}
                  description={item.description}
                  label={item.label}
              />
          )}
        />

        <ThemedButton
          onPress={openTaskModal}
          style={styles.btn}
        >
          <Text style={[styles.btnText ,{ marginRight: 20 }]}>+</Text>
          <Text style={styles.btnText}>Create Task</Text>
        </ThemedButton>

        <CreateTaskModal
          isVisible={taskModalVisible}
          onClose={closeTaskModal}
          onCreate={handleCreateTask}
          titleValue={taskName}
          onTitleChangeText={setTaskName}
          descriptionValue={taskDetail}
          onDescriptionChangeText={setTaskDetail}
          labelValue={taskLabel}
          onLabelChangeText={setTaskLabel}
          projectName={currentProjectName}
        />
      </SafeAreaView>
    </>
  );
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
  }
});