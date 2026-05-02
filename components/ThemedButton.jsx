import { Pressable, StyleSheet, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedButton = ({ style, disabled=false, cancel=false,...props }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    return (
        <Pressable
            style={({ pressed }) => [
                styles.btn,
                cancel && { backgroundColor: theme.borders},
                pressed && styles.pressed,
                disabled && styles.disabled, style]} // processed from left to right
            {...props}
        />
    )
}

export default ThemedButton

const styles = StyleSheet.create({
    btn: { // the normal, unpressed state of the button
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 13,
        borderRadius: 10
    },

    pressed: { // adds style to the button when pressed
        opacity: 0.8
    },

    disabled: {
        opacity: 0.5
    }
})