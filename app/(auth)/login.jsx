import { Alert } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'

import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedGradient from '../../components/ThemedGradient'
import BrandingContainer from '../../components/auth/BrandingContainer'
import AuthFooter from '../../components/auth/AuthFooter'
import AuthField from '../../components/auth/AuthField'
import AuthBody from '../../components/auth/AuthBody'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Please enter both email and password.")
            return
        }

        await login(email, password)
    }

    return (
        <>
            <ThemedGradient/>

            <BrandingContainer style={{ top: '12%' }}/>


            <AuthBody style={{ paddingBottom: 90 }}> 

                <AuthField
                    testID="login-email-input"
                    labelName="Email"
                    placeholder="Enter your email"
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="email"
                />


                <AuthField
                    testID="login-password-input"
                    labelName="Password"
                    placeholder="Enter your password"
                    onChangeText={setPassword}
                    value={password}
                    leftIcon="lock"
                    rightIcon={showPassword ? "eye" : "eye-off"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    secureTextEntry={!showPassword}
                />

                <Spacer height={25} />
                
                <ThemedButton
                    testID="login-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <ThemedText bold onPrimary style={{ fontSize: 18 }}>Login</ThemedText>
                </ThemedButton>

                <AuthFooter
                    labelText="Don't have an account?"
                    buttonText="Register here"
                    onPress={() => router.push('/(auth)/register')}
                    isLoading={isLoading}
                />
            </AuthBody>
        </>
    )
}

export default Login
