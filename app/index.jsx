// app/App.js
import { ActivityIndicator, StyleSheet } from "react-native"
import ThemedView from "../components/ThemedView"
import ThemedText from "../components/ThemedText"

const App = () => {
    return (
        <ThemedView style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
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
        fontSize: 16,
        color: "#555",
    },
})