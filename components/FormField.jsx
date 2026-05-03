import { StyleSheet, Text, useColorScheme } from 'react-native'
import React from 'react'
import ThemedTextInput from './ThemedTextInput'
import { Colors } from '../constants/Colors'

const FormField = ({ 
    labelName,
    placeholder,
    value,
    onChangeText,
    leftIcon,
    rightIcon,
    testID,
    keyboardType,
    autoCapitalize,
    readOnly,
    multiline
}) => {

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <Text style={[styles.label, { color: theme.text }]}>
                {labelName}
            </Text>
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
        marginBottom: 7,
    },
    textArea: {
        textAlignVertical: 'top',
        height: 80
    }
})