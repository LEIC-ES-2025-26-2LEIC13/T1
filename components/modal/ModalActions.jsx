import { StyleSheet, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import ThemedButton from '../ThemedButton'
import ThemedText from '../ThemedText'
import ThemedIcon from '../ThemedIcon'
import { Colors } from '../../constants/Colors'

// For two actions: "Cancel" and "Accept/Create/..."
const ModalActions = ({onCancel, primaryActionName, primaryActionIconName, onPrimaryActionPress, primaryActionDisabled, secondaryActionName, customStyle}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <View style={[styles.actions, customStyle]}>
            <ThemedButton style={[styles.actionButton, { backgroundColor: theme.borders }]} onPress={onCancel}>
                <ThemedText bold>{secondaryActionName ?? "Cancel"}</ThemedText>
            </ThemedButton>

            <ThemedButton 
                style={[styles.actionButton, !primaryActionDisabled && styles.primaryActionButton]}
                onPress={async () => {
                    setIsSubmitting(true) 
                    await onPrimaryActionPress()
                    setIsSubmitting(false)
                }}
                disabled={primaryActionDisabled || isSubmitting}
            >
                <ThemedIcon name={primaryActionIconName} onPrimary style={{ marginRight: 6 }}/>
                <ThemedText bold onPrimary>{primaryActionName}</ThemedText>
            </ThemedButton>
        </View>
  )
}

export default ModalActions

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 4,
    },
    actionButton: {
        flex: 1
    },
    primaryActionButton: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4
    }
})