import { StyleSheet, useColorScheme, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import ThemedText from "../components/ThemedText"
import ThemedButton from "../components/ThemedButton"
import { Colors } from "../constants/Colors"
import ThemedLogo from "../components/ThemedLogo"

const Intro = () => {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <LinearGradient
            colors={ colorScheme === "dark" ?
                [Colors.primary, theme.navBackground] :
                [theme.navBackground, Colors.primary]
            }
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <ThemedLogo/>

                <ThemedText style={styles.title} title>
                    Welcome to LEICo
                </ThemedText>

                <ThemedText style={styles.description}>
                    Organize your L.EIC projects, manage tasks, and collaborate with your team in one place.
                </ThemedText>

                <View style={styles.actions}>
                    <ThemedButton
                        testID="login-button"
                        style={styles.primaryButton}
                        onPress={() => router.push("/(auth)/login")}
                    >
                        <ThemedText bold onPrimary>Login</ThemedText>
                    </ThemedButton>

                    <ThemedButton
                            testID="register-button"
                            style={[styles.primaryButton, { backgroundColor: theme.borders }]}
                            onPress={() => router.push("/(auth)/register")}
                        >
                            <ThemedText bold onPrimary>Register</ThemedText>
                    </ThemedButton>
                </View>
            </View>
        </>
    )
}

export default Intro

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
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
    }
})