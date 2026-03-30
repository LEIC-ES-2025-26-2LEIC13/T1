import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.heading, { color: theme.title }]}>Project 1</Text>
            <Text style={[styles.heading, { color: theme.title }]}>Project 2</Text>
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