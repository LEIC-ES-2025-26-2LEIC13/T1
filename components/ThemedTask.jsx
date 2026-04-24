import React from 'react';
import { useColorScheme, StyleSheet, View } from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Colors } from "../constants/Colors";

// Colors for the labels
const LABEL_COLORS = {
    "Work": "#4F46E5",  
    "Urgent": "#DC2626",
    "Idea": "#059669",  
    "default": "#ac6f25" 
};

export default function ThemedTask({ name, description, label }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    const labelBgColor = LABEL_COLORS[label] || LABEL_COLORS.default;

    return (
        <ThemedView
            style={[
                styles.container,
                {
                    backgroundColor: theme.navBackground,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
            ]}
        >
            <View style={styles.topRow}>
                <ThemedText title3={true} style={styles.title} numberOfLines={2}>
                    {name}
                </ThemedText>

                {!!label && (
                    <View style={[styles.label, { backgroundColor: labelBgColor }]}>
                        <ThemedText style={styles.labelText}>
                            {label}
                        </ThemedText>
                    </View>
                )}
            </View>

            {!!description && (
                <ThemedText 
                    style={[styles.description, { color: theme.text }]} 
                    numberOfLines={3}
                >
                    {description}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
    description: {
        fontSize: 14,
        opacity: 0.6,
        lineHeight: 20,
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
});