import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ThemedButton from './ThemedButton';
import AppModal from './AppModal';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function InviteWorkspaceModal({
  visible,
  value,
  onChangeText,
  onClose,
  onInvite,
  workspaceName,
}) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme] ?? Colors.light;

  return (
    <AppModal visible={visible}>
      <Pressable
        onPress={onClose}
        style={styles.closeButton}
        testID="invite-modal-close"
        accessibilityRole="button"
        accessibilityLabel="Close invite popup"
      >
        <Ionicons name="close" size={20} color={palette.iconColor} />
      </Pressable>

      <Text style={[styles.title, { color: palette.title }]}>Invite to the Workspace</Text>
      <Text style={[styles.subtitle, { color: palette.text }]}>{workspaceName}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        testID="invite-username-input"
        placeholder="Enter username"
        placeholderTextColor={palette.iconColor}
        style={[
          styles.input,
          {
            color: palette.title,
            borderColor: palette.iconColor,
            backgroundColor: palette.navBackground,
          },
        ]}
      />

      <ThemedButton onPress={onInvite} style={{alignItems: 'center', padding: 12}}>
        <Text style={styles.inviteButtonText}>Invite</Text>
      </ThemedButton>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    paddingRight: 26,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
