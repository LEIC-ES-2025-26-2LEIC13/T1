import { Pressable, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedButton = ({ style, disabled=false, ...props }) => {
  return (
    <Pressable
    style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.disabled, style]} // processed from left to right
    {...props}
    />
  )
}

export default ThemedButton

const styles = StyleSheet.create({
    btn: { // the normal, unpressed state of the button
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10
    },

    pressed: { // adds style to the button when pressed
        opacity: 0.8
    },

    disabled: {
        opacity: 0.5
    }
})