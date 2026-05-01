import { Image, StyleSheet, useColorScheme, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import ThemedView from "../components/ThemedView"
import ThemedText from "../components/ThemedText"
import ThemedButton from "../components/ThemedButton"
import { Colors } from "../constants/Colors"

const Intro = () => {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
            colors={["#0f2f5e", "#1a5fa8", "#3b8fd4"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <Image
                    source={require("../assets/splash-icon.png")}
                    style={styles.image}
                    resizeMode="contain"
                />

                <ThemedText style={styles.title} title={true}>
                    Welcome to LEICo
                </ThemedText>

                <ThemedText style={styles.description}>
                    Organize your projects, manage tasks, and collaborate with your team in one place.
                </ThemedText>

                <View style={styles.actions}>
                    <ThemedButton
                        testID="login-button"
                        style={styles.primaryButton}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <ThemedText style={styles.buttonText}>Login</ThemedText>
                    </ThemedButton>

                    <ThemedButton
                            testID="register-button"
                            style={[styles.primaryButton, { backgroundColor: theme.card }]}
                            onPress={() => router.push("/(auth)/register")}
                        >
                            <ThemedText style={styles.buttonText}>Register</ThemedText>
                    </ThemedButton>
                </View>
            </View>
        </ThemedView>
    )
}

export default Intro

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
        image: {
        width: 180,
        height: 180,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: "rgba(255,255,255,0.86)",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
    },
    actions: {
        width: "100%",
        gap: 12,
    },
    primaryButton: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#123f79",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
})