import { StyleSheet, useColorScheme, Pressable} from 'react-native'
import {Colors} from "../constants/Colors";
import ThemedText from "./ThemedText";
import {useRouter} from "expo-router";

const ThemedProject = ({ name, description, borderColor, href, projectId, testID }) =>  {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const handlePress = () => {
        if (projectId) {
            router.push({ pathname: '/project', params: { projectId } })
            return
        }
    }

    return (
        <Pressable
            onPress={handlePress}
            style={[styles.container, { borderLeftColor: borderColor, backgroundColor: theme.navBackground }]}
            testID={testID}
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