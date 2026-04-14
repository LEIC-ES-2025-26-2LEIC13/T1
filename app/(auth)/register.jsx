import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, Alert } from 'react-native'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'

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
    const [loading, setLoading] = useState(false)

    const { register } = useUser()
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

        setLoading(true)
        try {
            await register(email, password)
            Alert.alert("Success", "Account created successfully!")
        } catch (error) {
            // Handle specific Firebase errors
            let errorMessage = error.message
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please use a different email or login instead."
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address is invalid. Please check and try again."
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "The password is too weak. Please use at least 6 characters."
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "Account creation is currently disabled. Please try again later."
            }
            Alert.alert("Registration Error", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>

            <ThemedText title={true} style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

            <Spacer />

            <ThemedText style={{ width: '80%', marginBottom: 5 }}>Email</ThemedText>
            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              testID="register-email-input"
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedText style={{ width: '80%', marginBottom: 5 }}>Password</ThemedText>
            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              testID="register-password-input"
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              editable={!loading}
              secureTextEntry
            />

            <ThemedText style={{ width: '80%', marginBottom: 5 }}>Confirm Password</ThemedText>
            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              testID="register-confirm-password-input"
              placeholder="Confirm Password"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              editable={!loading}
              secureTextEntry
            />

            <Spacer />

            <ThemedButton
              testID="register-submit-button"
              onPress={handleSubmit}
              disabled={loading}
              style={{width: '80%', alignItems: 'center'}}
            >
                <Text style={{color: "#ffffff"}}>{loading ? "Creating account..." : "Register"}</Text>
            </ThemedButton>

            <Spacer />

            <Text style={{color: '#aaa'}}>Already have an account? </Text>
            <Spacer height={10}/>
            <ThemedButton
              onPress={() => router.back()}
              disabled={loading}
              style={{paddingVertical: 8}}
            >
                <Text style={{color: "#fff"}}>Login here</Text>
            </ThemedButton>

        </ThemedView>
      </TouchableWithoutFeedback>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
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

