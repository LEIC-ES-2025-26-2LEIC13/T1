// app/App.js
import { ActivityIndicator, StyleSheet } from "react-native"
import ThemedView from "../components/ThemedView"
import ThemedText from "../components/ThemedText"
import { Colors } from "../constants/Colors"

const App = () => {
    return (
        <ThemedView style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText style={styles.text}>
                Loading...
            </ThemedText>
        </ThemedView>
    )
}

export default App

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 15,
        fontSize: 16
    },
})