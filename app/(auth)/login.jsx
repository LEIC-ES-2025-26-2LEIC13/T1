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
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoading } = useAuth()
    const router = useRouter()

    // Alert
	const [alertVisible, setAlertVisible] = useState(false);
	const [alert, setAlert] = useState({ type: '', title: '', message: '' });

	const showAlert = (type, title, message) => {
		setAlert({ type, title, message });
		setAlertVisible(true);
	};

    const handleSubmit = async () => {
        if (!email || !password) {
            showAlert(ALERT_TYPES.ERROR, 'Missing fields', 'Please enter both email and password.');
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
                    onPrimary
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
                    onPrimary
                />

                <Spacer height={25} />
                
                <ThemedButton
                    testID="login-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <ThemedText bold onPrimary>Login</ThemedText>
                </ThemedButton>

                <AuthFooter
                    labelText="Don't have an account?"
                    buttonText="Register here"
                    onPress={() => router.push('/(auth)/register')}
                    isLoading={isLoading}
                />
            </AuthBody>

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)}

            />
        </>
    )
}

export default Login
