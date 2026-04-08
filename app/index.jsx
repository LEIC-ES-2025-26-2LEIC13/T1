// app/App.js
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet } from "react-native"
import { useUser } from "../hooks/useUser"
import { useRouter } from "expo-router"
import ThemedView from "../components/ThemedView"
import ThemedText from "../components/ThemedText"

const App = () => {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // User is logged in → go to home/project_tab
                router.replace("/(home)/(tabs)/project_tab")
            } else {
                // User is not logged in → go to login screen
                router.replace("/(auth)/login")
            }
        }
    }, [user, isLoading])

    return (
        <ThemedView style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <ThemedText style={styles.text}>
                {isLoading ? "Checking authentication..." : "Redirecting..."}
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