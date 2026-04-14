import {StyleSheet, Text, Alert, Keyboard, ScrollView} from 'react-native'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const { login } = useUser() // destructuring the return value of the useUser custom hook
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Please enter both email and password.")
            return
        }

        setLoading(true)
        try {
            await login(email, password)
        } catch (error) {
            // Handle specific Firebase errors
            let errorMessage = error.message
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email. Please register first."
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password. Please try again."
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address is invalid."
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = "This account has been disabled."
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed login attempts. Please try again later."
            }
            Alert.alert("Login Error", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={false}
                onTouchStart={Keyboard.dismiss}
            >
                <ThemedText title={true} style={styles.title}>Welcome Back!</ThemedText>
                <ThemedText style={styles.subtitle}>Login to continue</ThemedText>

                <Spacer />


                <ThemedTextInput
                  style={{ width: '80%', marginBottom: 20}}
                  testID="login-email-input"
                  placeholder="Email"
                  onChangeText={setEmail}
                  value={email}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ThemedTextInput
                  style={{ width: '80%', marginBottom: 20}}
                  testID="login-password-input"
                  placeholder="Password"
                  onChangeText={setPassword}
                  value={password}
                  editable={!loading}
                  secureTextEntry
                />

                <Spacer />

                <ThemedButton
                  testID="login-submit-button"
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{width: '80%', alignItems: 'center'}}
                >
                    <Text style={{color: "#ffffff"}}>{loading ? "Logging in..." : "Login"}</Text>
                </ThemedButton>

                <Spacer />

                <Text style={{color: '#aaa'}}>Don&apos;t have an account? </Text>
                <Spacer height={10}/>
                <ThemedButton
                  onPress={() => router.push('/(auth)/register')}
                  disabled={loading}
                  style={{paddingVertical: 8}}
                >
                    <Text style={{color: "#ffffff"}}>Register here</Text>
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

    scrollContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    title: {
        textAlign: 'center',
        fontSize: 30,
        marginBottom: 5
    },

    subtitle: {
        textAlign: 'center',
        fontSize: 20
    }
})