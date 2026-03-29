import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InviteWorkspaceModal({
  visible,
  value,
  onChangeText,
  onClose,
  onInvite,
  palette,
  workspaceName,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} testID="invite-modal-overlay">
        <View style={[styles.modalCard, { backgroundColor: palette.navBackground }]}>
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
                backgroundColor: palette.inputTextBackground,
              },
            ]}
          />

          <Pressable
            onPress={onInvite}
            testID="invite-submit"
            style={({ pressed }) => [
              styles.inviteButton,
              { backgroundColor: '#2563eb' },
              pressed && styles.inviteButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send invite"
          >
            <Text style={styles.inviteButtonText}>Invite</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
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
  inviteButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inviteButtonPressed: {
    opacity: 0.8,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
