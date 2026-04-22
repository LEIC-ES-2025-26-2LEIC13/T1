import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Colors } from "../constants/Colors";
import { useColorScheme, StyleSheet, View } from "react-native";

export default function Task({ name, description, label }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <ThemedView
            style={[
                styles.container,
                {
                    backgroundColor: theme.navBackground,
                    borderColor: theme.border
                }
            ]}
        >
            <View style={styles.topRow}>
                <ThemedText title3={true} style={styles.title}>
                    {name}
                </ThemedText>

                {label && (
                    <View style={styles.label}>
                        <ThemedText style={styles.labelText}>
                            {label}
                        </ThemedText>
                    </View>
                )}
            </View>

            {description && (
                <ThemedText style={styles.description}>
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
        borderRadius: 14,
        borderWidth: 1,

        // modern card shadow (iOS + Android)
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
        paddingRight: 10,
    },

    description: {
        fontSize: 14,
        opacity: 0.7,
        lineHeight: 20,
    },

    // LABEL CHIP
    label: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#4F46E5",
        alignSelf: "flex-start",
    },

    labelText: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
    },
});
