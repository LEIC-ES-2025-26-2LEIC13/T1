import { View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import ThemedProject from '../../components/ThemedProject';

const Projects = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const borderColors = ["#4694fb", "#a950fa", "#d75bfb", "#f8d768"];

    // This must be done by calling API for projects
    const projectData = [
        { name: "Project 1", description: "Description 1" },
        { name: "Project 2", description: "Description 2" },
        { name: "Project 3", description: "Description 3" },
        { name: "Project 4", description: "Description 4" }
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {projectData.map((p, i) => (
                <ThemedProject
                    key={i}
                    name={p.name}
                    description={p.description}
                    borderColor={borderColors[i % borderColors.length]} // loop colors
                    href="/project"
                />
            ))}
        </View>
    )
}

export default Projects;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
})