import { StyleSheet, View } from 'react-native'
import React from 'react'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

const AuthField = ({ labelName, placeholder, testID, value, onChangeText, keyboardType, autoCapitalize, leftIcon, rightIcon, onRightIconPress, secureTextEntry, onPrimary }) => {
    return (
        <View style={styles.inputContainer}>
            <ThemedText onPrimary={onPrimary} style={styles.inputLabel}>{labelName}</ThemedText>
            <ThemedTextInput
                testID={testID}
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                onRightIconPress={onRightIconPress}
                secureTextEntry={secureTextEntry}
            />
        </View>
    )
}

export default AuthField

const styles = StyleSheet.create({
     inputContainer: {
        width: '100%',
        marginBottom: 10
    },
    
    inputLabel: {
        fontSize: 18,
        letterSpacing: 2,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: 'flex-start',
    }
})