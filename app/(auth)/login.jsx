import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'

// themed components
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = () => {
        console.log("Login form submitted", email, password)
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>

            <ThemedText title={true} style={styles.title}>Welcome Back!</ThemedText>
            <ThemedText style={styles.subtitle}>Login to continue</ThemedText>
            
            <Spacer />

            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              placeholder="Username"
              keyboardType="email-address" // keyboard will be show the @ char automatically
              onChangeText={setEmail} // setter function of the state variable
              value={email} // what will be displayed
            />

            <ThemedTextInput
              style={{ width: '80%', marginBottom: 20}}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />


            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: "#ffffff"}}>Login</Text>
            </ThemedButton>
        
            <Spacer />

            <Link href="/" style={styles.link}> 
                <ThemedText>Back to the Home Page</ThemedText>
            </Link>

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
    },

    link: {
        marginVertical: 10,
        borderBottomWidth: 1
    }
})