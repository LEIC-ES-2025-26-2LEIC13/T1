import React from 'react';
import { Alert, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import IconButton from '../components/IconButton';
import InviteWorkspaceModal from '../components/InviteWorkspaceModal';
import { Colors } from '../constants/Colors';
import TopBar from '../components/TopBar';
import { SafeAreaView } from 'react-native-safe-area-context';
 
export default function Home() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(false); // State to control the visibility of the invite modal (popup)
  const [inviteTarget, setInviteTarget] = React.useState(''); // State to hold the username of the user
  const scheme = useColorScheme(); // hook to get the current color scheme
  const palette = Colors[scheme] ?? Colors.light; // Collor palette based on user's theme
  const currentProjectName = 'Programming Project'; // Current project name (could be dynamic)

  // Shows the invite modal box
  const handleInvitePress = () => {
    setModalVisible(true);
  };

  // Closes the invite modal box and resets the input field
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
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <TopBar
        title={currentProjectName}
        leftAction={(
          <Pressable onPress={handleGoBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={palette.title} />
          </Pressable>
        )}
        rightAction={<IconButton id="workspace-invite" onPress={handleInvitePress} color={palette.title} />}
      />

      <InviteWorkspaceModal
        visible={modalVisible}
        value={inviteTarget}
        onChangeText={setInviteTarget}
        onClose={handleCloseModal}
        onInvite={handleSendInvite}
        palette={palette}
        workspaceName={currentProjectName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});