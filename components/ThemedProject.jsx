import {View, StyleSheet, useColorScheme, Pressable} from 'react-native'
import {Colors} from "../constants/Colors";
import ThemedText from "./ThemedText";
import {useRouter} from "expo-router";

const ThemedProject = ({ name, description, borderColor, href }) =>  {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Pressable
            onPress={() => href && router.push(href)}
            style={[styles.container, { borderLeftColor: borderColor, backgroundColor: theme.navBackground }]}
        >
            <ThemedText title={true} style={styles.name}>{name}</ThemedText>
            <ThemedText>{description}</ThemedText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 5,
        justifyContent: "center",
        backgroundColor: "#fff"
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    }

})

export default ThemedProject