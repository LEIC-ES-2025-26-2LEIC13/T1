import { StyleSheet, useColorScheme, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import ThemedText from "../components/ThemedText"
import { Colors } from "../constants/Colors"
import ThemedLogo from "../components/ThemedLogo"
import { GoogleSigninButton } from "@react-native-google-signin/google-signin"
import { useState} from "react"
import { useAuth } from "../hooks/useAuth"
import ThemedAlert, { ALERT_TYPES } from "../components/ThemedAlert"

const Intro = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const { googleLogin, isLoading} = useAuth()
    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    const handleSignInPress = async () => {
        try {
            await googleLogin()
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Login Error", error?.message || 'Google sign-in failed')
        }
    }

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
                    <GoogleSigninButton onPress={handleSignInPress} disabled={isLoading} />
                </View>
            </View>

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)}
            />
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
    primaryButton: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 12,
    }
})