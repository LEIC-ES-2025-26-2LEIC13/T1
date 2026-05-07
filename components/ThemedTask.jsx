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
            style={styles.touch}
        >
            {card}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        gap: 10
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
    },
    label: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    labelText: {
        fontSize: 11,
        color: "white",
        fontWeight: "bold",
    },
    touch: {
        marginVertical: 6,
    },
    
    cardOuter: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
});