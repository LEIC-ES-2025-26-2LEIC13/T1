import { StyleSheet, TextInput, useColorScheme, View } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedIcon from './ThemedIcon'

const ThemedTextInput = ({
    style,
    containerStyle,
    testID,
    placeholder,
    leftIcon,
    rightIcon,
    readOnly,
    multiline,
    ...props
}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View style={[
            { borderColor: theme.borders },
            styles.container,
            containerStyle
            ]}>
        {leftIcon && <ThemedIcon name={leftIcon} style={styles.leftIcon} />}
        
        <TextInput
            testID={testID}
            placeholder={placeholder}
            readOnly={readOnly}
            multiline={multiline}
            scrollEnabled={false}
            style={[
            {
                backgroundColor: theme.background,
                color: theme.text
            },
            styles.input,
            style
            ]}
            {...props}
        />

        {rightIcon && <ThemedIcon name={rightIcon} style={styles.rightIcon} />}
        </View>
    )
}

export default ThemedTextInput


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden'
    },
    leftIcon: {
        paddingLeft: 16
    },
    rightIcon: {
        // not needed for now
    },
    input: {
        flex: 1,
        padding: 16
    }
})
    
