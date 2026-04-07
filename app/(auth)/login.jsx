import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, Alert } from 'react-native'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const { login } = useUser() // destructuring the return value of the useUser custom hook

    const handleSubmit = async () => {
        const success = await login(username, password)
        if (!success) Alert.alert("Invalid credentials", "Please insert correct credentials.")
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>

            <ThemedText title={true} style={styles.title}>Welcome Back!</ThemedText>
            <ThemedText style={styles.subtitle}>Login to continue</ThemedText>
            
            <Spacer />

            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              testID="login-username-input"
              placeholder="Username"
              onChangeText={setUsername} // setter function of the state variable
              value={username} // what will be displayed
            />

            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              testID="login-password-input"
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />

            <Spacer />

            <ThemedButton testID="login-submit-button" onPress={handleSubmit} style={{width: '80%', alignItems: 'center'}}>
                <Text style={{color: "#ffffff"}}>Login</Text>
            </ThemedButton>

        </ThemedView>
      </TouchableWithoutFeedback>
    )
}

export default Login

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