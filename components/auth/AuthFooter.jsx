import { StyleSheet, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedText from '../ThemedText'
import Spacer from '../Spacer'
import ThemedButton from '../ThemedButton'
import { Colors } from '../../constants/Colors'
import Divider from '../Divider'

const AuthFooter = ({ labelText, buttonText, onPress, isLoading }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <Spacer height={20} />
                <Divider/>
            <Spacer height={20} />

            <View style={styles.footerContainer}>
                <ThemedText>{labelText}</ThemedText>
                <Spacer height={10} />
                <ThemedButton
                    onPress={onPress}
                    disabled={isLoading}
                    style={[styles.authButton, { borderColor: theme.borders }]}
                >
                    <ThemedText bold onPrimary>{buttonText}</ThemedText>
                </ThemedButton>
            </View>
        </>
    )
}

export default AuthFooter

const styles = StyleSheet.create({
    footerContainer: {
        alignItems: 'center',
        marginTop: 10
    },

    authButton: { 
        paddingVertical: 10,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        width: '80%',
        alignItems: 'center'
    }
})