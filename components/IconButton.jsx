import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function IconButton({ onPress, color = '#111111', id }) {
  return (
    <Pressable
      onPress={onPress}
      testID={id}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Invite user"
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons name="person-add-outline" size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  buttonPressed: {
    opacity: 0.65,
  },
});
