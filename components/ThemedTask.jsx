import React from 'react';
import { useColorScheme, StyleSheet, Pressable} from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Colors, LabelColors } from "../constants/Colors";
import Pill from './Pill';
import { LABELS } from '../constants/Labels';
import AnimatedPressable from './AnimatedPressable';


export default function ThemedTask({ task, onPress}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const labelBgColor = LabelColors[task.label] || LabelColors.default;

    const card = (
        <ThemedView style={[ styles.card, { borderColor: theme.borders } ]}
>
            
            <ThemedText title bold>{task.name}</ThemedText>
            
            {task.description && (
            <ThemedText>{task.description}</ThemedText>
            )}
            
            {task.label && (
                <Pill
                    name={task.label}
                    iconName={LABELS.find(label => label.name === task.label)?.icon}
                    customStyle={{ backgroundColor: `${labelBgColor}50` }}
                />
            )}
            
        </ThemedView>
    );

    return (
        <AnimatedPressable
            onPress={onPress}
            style={ {marginVertical: 6}}
        >
            {card}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 6,
        borderWidth: 1,
        gap: 10,
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.15)"
    }
});