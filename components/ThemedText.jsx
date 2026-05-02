import { StyleSheet, Text, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedText = ({ style, title=false, bold=false, onPrimary=false, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const textColor = title ? theme.title : theme.text

    return (
        <Text 
            style={[
                { color: textColor },
                bold && styles.bold,
                onPrimary && { color: theme.onPrimary },
                style]} 
            {...props}
        />
    )
}

export default ThemedText

const styles = StyleSheet.create({
    bold: {
        fontWeight: '600',
        fontSize: 15
    }
})