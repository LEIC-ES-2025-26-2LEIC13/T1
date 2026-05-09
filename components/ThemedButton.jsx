import { StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'
import AnimatedPressable from './AnimatedPressable'

const ThemedButton = ({ style, disabled=false,...props }) => {
    
    return (
        <AnimatedPressable
            disabled={disabled}
            style={[
                styles.btn,
                disabled && styles.disabled,
                style
            ]} // processed from left to right
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

    disabled: {
        opacity: 0.5
    }
})