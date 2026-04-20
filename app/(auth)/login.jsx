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

    const { login, isLoading } = useUser() // destructuring the return value of the useUser custom hook
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Please enter both email and password.")
            return
        }

        try {
            await login(email, password)
        } catch (error) {
            // Handle specific Firebase errors
            let errorMessage

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "The email address is invalid."
                    break
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled."
                    break
                case 'auth/user-not-found': // Legacy (depending on your project's Email Enumeration Protection setting)
                    errorMessage = "No account found with this email. Please register first."
                    break
                case 'auth/wrong-password': // Legacy
                case 'auth/invalid-credential': // Modern Firebase unified error for wrong email/password
                    errorMessage = "Incorrect email or password. Please try again."
                    break
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed login attempts. Please try again later."
                    break
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection."
                    break
                default:
                    errorMessage = error.message // Fallback to raw Firebase message
            }
            
            Alert.alert("Login Error", errorMessage)
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
                  editable={!isLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ThemedTextInput
                  style={{ width: '80%', marginBottom: 20}}
                  testID="login-password-input"
                  placeholder="Password"
                  onChangeText={setPassword}
                  value={password}
                  editable={!isLoading}
                  secureTextEntry
                />

                <Spacer />

                <ThemedButton
                  testID="login-submit-button"
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={{width: '80%', alignItems: 'center'}}
                >
                    <Text style={{color: "#ffffff"}}>Login</Text>
                </ThemedButton>

                <Spacer />

                <Text style={{color: '#aaa'}}>Don&apos;t have an account? </Text>
                <Spacer height={10}/>
                <ThemedButton
                  onPress={() => router.push('/(auth)/register')}
                  disabled={isLoading}
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
