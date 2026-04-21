import { TextInput, useColorScheme, View } from 'react-native'
import { Colors } from '../constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'

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
    <View style={[{ position: 'relative' }, containerStyle]}>
      {leftIcon ? (
        <Ionicons
          name={leftIcon}
          size={20}
          color={theme.text}
          style={{ position: 'absolute', left: 16, top: 18, zIndex: 1 }}
        />
      ) : null}

      <TextInput
        testID={testID}
        style={[
          {
            backgroundColor: theme.background,
            color: theme.text,
            padding: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
            paddingLeft: leftIcon ? 46 : 20,
            paddingRight: rightIcon ? 46 : 20
          },
          style
        ]}
        {...props}
      />

      {rightIcon ? (
        <Ionicons
          name={rightIcon}
          size={20}
          color={theme.text}
          style={{ position: 'absolute', right: 16, top: 18, zIndex: 1 }}
        />
      ) : null}
    </View>
  )
}

export default ThemedTextInput
