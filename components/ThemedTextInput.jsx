import { TextInput, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedTextInput = ({style, ...props}) => { // if no prop is specified, style and ...props will both be undefined (ignored by React Native in the styles array)
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <TextInput
            style={[ // array of styles to apply
                {
                  backgroundColor: theme.navBackground,
                  color: theme.text,
                  padding: 20,
                  borderRadius: 6
                },
                style
            ]}
            {...props}
        />
    )
}

export default ThemedTextInput
