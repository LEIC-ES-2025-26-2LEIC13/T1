import { View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Link } from 'expo-router';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Link href="/project" style={[styles.heading, { color: theme.title }]}>Project 1</Link>
            <Link href="/project" style={[styles.heading, { color: theme.title }]}>Project 2</Link>
        </View>
    )
}

export default Projects;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
})