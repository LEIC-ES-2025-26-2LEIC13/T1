import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ThemedButton from './ThemedButton';
import AppModal from './AppModal';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

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
      <View style={styles.header}>
        <ThemedText title={true} style={styles.headerTitle}>
          Invite to Workspace
        </ThemedText>
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          testID="invite-modal-close"
          accessibilityRole="button"
          accessibilityLabel="Close invite popup"
        >
          <Ionicons name="close" size={24} color={palette.iconColor} />
        </Pressable>
      </View>

      <ThemedText style={styles.subtitle}>{workspaceName}</ThemedText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        testID="invite-email-input"
        placeholder="Enter user email"
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

      <ThemedButton onPress={onInvite} style={styles.inviteButton} disabled={!value.trim()}>
        <Text style={styles.inviteButtonText}>Invite</Text>
      </ThemedButton>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inviteButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});


