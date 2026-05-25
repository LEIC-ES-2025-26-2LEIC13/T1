import { StyleSheet, TextInput, useColorScheme, View } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedIcon from './ThemedIcon'
import AnimatedPressable from './AnimatedPressable'

const ThemedTextInput = ({
    style,
    containerStyle,
    testID,
    placeholder,
    leftIcon,
    rightIcon,
    onRightIconPress,
    readOnly,
    multiline,
    ...props
}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const rightIconComponent = () => {
        if (onRightIconPress) {
            return (
                <AnimatedPressable onPress={onRightIconPress}>
                    <ThemedIcon name={rightIcon} onPress={onRightIconPress} style={styles.rightIcon} />
                </AnimatedPressable>
            )
        }
        
        return <ThemedIcon name={rightIcon} style={styles.rightIcon} />
    
    }

    return (
        <View style={[
            { borderColor: theme.borders, backgroundColor: theme.background },
            styles.container,
            multiline && { alignItems: 'flex-start' },
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

        
        {rightIcon && rightIconComponent()}
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
        paddingRight: 16
    },
    input: {
        flex: 1,
        padding: 16
    }
})
    
