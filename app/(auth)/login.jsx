import { StyleSheet, Text, Alert, Keyboard, ScrollView, View, useColorScheme } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Please enter both email and password.")
            return
        }

        try {
            await login(email, password)
        } catch (error) {
            let errorMessage

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "The email address is invalid."
                    break
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled."
                    break
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email. Please register first."
                    break
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = "Incorrect email or password. Please try again."
                    break
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed login attempts. Please try again later."
                    break
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection."
                    break
                default:
                    errorMessage = error.message
            }

            Alert.alert("Login Error", errorMessage)
        }
    }

    return (
        <ThemedView style={styles.container}>

            {/* Full-screen background gradient */}
            <LinearGradient
                colors={['#0f2f5e', '#1a5fa8', '#3b8fd4']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* App branding in the upper area */}
            <View style={styles.brandingContainer}>
                <Text style={styles.appName}>LEICo</Text>
                <Text style={styles.slogan}>From students to students</Text>
            </View>

            {/* Gradient fading into the card */}
            <LinearGradient
                colors={['transparent', theme.navBackground]}
                style={styles.cardGradient}
            />

            {/* Bottom card sheet */}
            <View
                pointerEvents="none"
                style={[
                    styles.bottomSheet,
                    { backgroundColor: theme.navBackground }
                ]}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={false}
                onTouchStart={Keyboard.dismiss}
            >
                <ThemedText style={styles.subtitle}>Login to continue</ThemedText>

                <Spacer />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="login-email-input"
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    editable={!isLoading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="login-password-input"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    editable={!isLoading}
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                />

                <Spacer />

                <ThemedButton
                    testID="login-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={{ width: '80%', alignItems: 'center' }}
                >
                    <Text style={{ color: "#ffffff" }}>Login</Text>
                </ThemedButton>

                <Spacer />

                <Text style={{ color: '#aaa' }}>Don&apos;t have an account? </Text>
                <Spacer height={10} />
                <ThemedButton
                    onPress={() => router.push('/(auth)/register')}
                    disabled={isLoading}
                    style={{ paddingVertical: 8 }}
                >
                    <Text style={{ color: "#ffffff" }}>Register here</Text>
                </ThemedButton>
            </ScrollView>
        </ThemedView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    cardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
    },

    scrollContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 100,
    },

    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden',
        elevation: 4,
    },

    title: {
        textAlign: 'center',
        fontSize: 30,
        marginBottom: 5
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 20
    },

    brandingContainer: {
        position: 'absolute',
        top: '18%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    appName: {
        fontSize: 52,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 1.5,
    },

    slogan: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: 6,
        letterSpacing: 0.5,
    },
})