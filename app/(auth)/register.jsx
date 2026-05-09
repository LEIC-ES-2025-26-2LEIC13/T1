import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'

import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import ThemedButton from '../../components/ThemedButton'
import ThemedGradient from '../../components/ThemedGradient'
import BrandingContainer from '../../components/auth/BrandingContainer'
import AuthBody from '../../components/auth/AuthBody'
import AuthField from '../../components/auth/AuthField'
import AuthFooter from '../../components/auth/AuthFooter'
import ThemedAlert, { ALERT_TYPES } from '../../components/ThemedAlert'

const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { isLoading, register } = useAuth()
    const router = useRouter()

    // Alert
	const [alertVisible, setAlertVisible] = useState(false);
	const [alert, setAlert] = useState({ type: '', title: '', message: '' });

	const showAlert = (type, title, message) => { // function to call when an alert needs to be shown
		setAlert({ type, title, message });
		setAlertVisible(true);
	};

    const handleSubmit = async () => {
        if (!email || !password || !confirmPassword) {
            showAlert(ALERT_TYPES.WARNING, "Missing fields", "Please fill in all fields.")
            return
        }

        if (password !== confirmPassword) {
            showAlert(ALERT_TYPES.WARNING, "Password mismatch", "Passwords do not match. Please try again.")
            return
        }

        if (password.length < 6) {
            showAlert(ALERT_TYPES.WARNING, "Weak password", "Password must be at least 6 characters long.")
            return
        }

        await register(email, password)
    }

    return (

        <>
            <ThemedGradient/>

            <BrandingContainer style={{ top: '7%' }}/>


            <AuthBody style={{ paddingBottom: 65 }}> 

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

                <AuthField
                    testID="login-confirm-password-input"
                    labelName="Confirm Password"
                    placeholder="Confirm your password"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    leftIcon="lock"
                    rightIcon={showConfirmPassword ? "eye" : "eye-off"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    secureTextEntry={!showConfirmPassword}
                />

                <Spacer height={5} />
                
                <ThemedButton
                    testID="login-submit-button"
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <ThemedText bold onPrimary>Register</ThemedText>
                </ThemedButton>

                <AuthFooter
                    labelText="Already have an account?"
                    buttonText="Login here"
                    onPress={() => router.push('/(auth)/login')}
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

export default Register
