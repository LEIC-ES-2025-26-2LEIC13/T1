import React from 'react';
import { useColorScheme, StyleSheet, Pressable} from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Colors } from "../constants/Colors";
import Pill from './Pill';
import { LABELS } from '../constants/Labels';

// Colors for the labels
const LABEL_COLORS = {
    "Work": "#4F46E5",  
    "Urgent": "#DC2626",
    "Idea": "#059669",  
    "default": "#ac6f25" 
};

export default function ThemedTask({ task, onPress}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const labelBgColor = LABEL_COLORS[task.label] || LABEL_COLORS.default;

    const card = (
        <ThemedView style={[ styles.card, { borderColor: theme.borders }]}
>
            
            <ThemedText title bold>{task.name}</ThemedText>
            
            {task.description && (
            <ThemedText>{task.description}</ThemedText>
            )}
            
            {task.label && (
                <Pill
                    name={task.label}
                    iconName={LABELS.find(label => label.name === task.label)?.icon}
                />
            )}
            
        </ThemedView>
    );

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {marginVertical: 6}, 
                {
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                }
            ]}
        >
            {card}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 6,
        borderWidth: 1,
        gap: 10
    }
});