import { Keyboard, StyleSheet, Text, Alert, ScrollView, View, useColorScheme } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '../../constants/Colors'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { isLoading, register } = useAuth()
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Missing fields", "Please fill in all fields.")
            return
        }

        if (password !== confirmPassword) {
            Alert.alert("Password mismatch", "Passwords do not match. Please try again.")
            return
        }

        if (password.length < 6) {
            Alert.alert("Weak password", "Password must be at least 6 characters long.")
            return
        }

        await register(email, password)
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

            {/* App branding */}
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
                <ThemedText style={styles.subtitle}>Create your account</ThemedText>

                <Spacer />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="register-email-input"
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
                    testID="register-password-input"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    editable={!isLoading}
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                />

                <ThemedTextInput
                    containerStyle={{ width: '80%', marginBottom: 20 }}
                    testID="register-confirm-password-input"
                    placeholder="Confirm Password"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    editable={!isLoading}
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                />

                <Spacer />

                <ThemedButton
                    testID="register-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={{ width: '80%', alignItems: 'center' }}
                >
                    <Text style={{ color: "#ffffff" }}>Register</Text>
                </ThemedButton>

                <Spacer />

                <ThemedText style={{ color: '#aaa' }}>Already have an account? </ThemedText>
                <Spacer height={10} />
                <ThemedButton
                    onPress={() => router.push('/(auth)/login')}
                    disabled={isLoading}
                    style={{ paddingVertical: 8 }}
                >
                    <Text style={{ color: "#ffffff" }}>Login here</Text>
                </ThemedButton>
            </ScrollView>

        </ThemedView>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    brandingContainer: {
        position: 'absolute',
        top: '10%',
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

    cardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
    },

    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '67%',      // taller than Login to fit the 3 fields
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden',
        elevation: 4,
    },

    scrollContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 20,
    },
})