import { StyleSheet } from 'react-native'
import React from 'react'
import ThemedTextInput from './ThemedTextInput'
import ThemedText from './ThemedText'

const FormField = ({ 
    testID,
    labelName,
    placeholder,
    value,
    onChangeText,
    leftIcon,
    rightIcon,
    keyboardType,
    autoCapitalize,
    readOnly,
    multiline,
    secureTextEntry
}) => {

    return (
        <>
            <ThemedText style={[styles.label]}>
                {labelName}
            </ThemedText>
            
            <ThemedTextInput
                style={multiline && styles.textArea}
                testID={testID}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                readOnly={readOnly}
                multiline={multiline}
                secureTextEntry={secureTextEntry}
            />
        </>
    )
}

export default FormField

const styles = StyleSheet.create({
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 7,
        opacity: 0.7
    },
    textArea: {
        textAlignVertical: 'top',
        height: 80
    }
})