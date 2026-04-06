import React from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '../constants/Colors';
import InviteWorkspaceModal from '../components/InviteWorkspaceModal';
import TaskModal from '../components/TaskModal';
import ThemedButton from "../components/ThemedButton";
import ThemedText from "../components/ThemedText";

export default function Home() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme] ?? Colors.light;

  const [taskModalVisible, setTaskModalVisible] = React.useState(false);
  const [taskName, setTaskName] = React.useState('');
  const [taskDetail, setTaskDetail] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [inviteTarget, setInviteTarget] = React.useState('');

  const currentProjectName = 'Programming Project';

  const openTaskModal = () => setTaskModalVisible(true);

  const closeTaskModal = () => {
    setTaskModalVisible(false);
    setTaskName('');
    setTaskDetail('');
  };

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    closeTaskModal();

    Toast.show({
      type: 'success',
      text1: 'Task created',
      text2: taskName,
    });
  };

  const handleInvitePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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

  const handleSendInvite = () => {
    const trimmedTarget = inviteTarget.trim();

    if (!trimmedTarget) {
      Alert.alert('Missing user', 'Please enter a valid username.');
      return;
    }

    handleCloseModal();

    Toast.show({
      type: 'success',
      text1: 'Invite sent',
      text2: `Invitation sent to ${trimmedTarget}.`,
      position: 'top',
      visibilityTime: 1500,
      topOffset: 100,
    });
  };

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
            <Pressable onPress={handleGoBack} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color={palette.title} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleInvitePress} hitSlop={10}>
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
          visible={modalVisible}
          value={inviteTarget}
          onChangeText={setInviteTarget}
          onClose={handleCloseModal}
          onInvite={handleSendInvite}
          workspaceName={currentProjectName}
        />

        <ThemedButton
          onPress={openTaskModal}
          style={styles.btn}
        >
          <Text style={{color: 'white'}}>+</Text>
          <Text style={{color: 'white'}}>Create Task</Text>
        </ThemedButton>

        <TaskModal
          visible={taskModalVisible}
          onClose={closeTaskModal}
          onCreate={handleCreateTask}
          value={taskName}
          onChangeText={setTaskName}
          detailValue={taskDetail}
          onDetailChangeText={setTaskDetail}
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
  }
});