import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { Colors } from "../constants/Colors";
import { useColorScheme, StyleSheet } from "react-native";

export default function Task({name, description}){
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return(
        <ThemedView style={[styles.container, { backgroundColor: theme.navBackground }]}>
            <ThemedText title3={true} style={styles.title}>{name}</ThemedText>
            { description && <ThemedText style={styles.description}>{description}</ThemedText>}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 0.2,
        justifyContent: "center",
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    description: {
        fontSize: 14,
        opacity: 0.8,
    }
})
