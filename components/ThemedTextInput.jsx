import { StyleSheet, TextInput, useColorScheme, View } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedIcon from './ThemedIcon'

const ThemedTextInput = ({
  style,
  containerStyle,
  testID,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <View style={styles.container}>
      {leftIcon ? (
        <ThemedIcon
            name={leftIcon}
            style={{ position: 'absolute', left: 16, top: 21, zIndex: 1 }}
        />
      ) : null}

      <TextInput
        testID={testID}
        style={[
          {
            backgroundColor: theme.background,
            color: theme.text,
            borderColor: theme.borders,
            paddingLeft: leftIcon ? 46 : 20,
            paddingRight: rightIcon ? 46 : 20
          },
          styles.input,
          style
        ]}
        {...props}
      />

      {rightIcon ? (
        <ThemedIcon
            name={rightIcon}
            style={{ position: 'absolute', right: 16, top: 21, zIndex: 1 }}
        />
      ) : null}
    </View>
  )
}

export default ThemedTextInput


const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%', // not always...
        marginBottom: 15
    },

    input: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1
    }
})
    
