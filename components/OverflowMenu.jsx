import React from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import ThemedIcon from './ThemedIcon';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

export default function OverflowMenu({ testID, actions = [] }) {
    // If inside the actions passed there is a confirmation step, for example, upon deletion of a project, the 
    // user is reprompted to be sure of his operation
    const handleSelect = (action) => {
        // Shows the alert action
        if (action.confirm) {
            Alert.alert(
                action.confirm.title,
                action.confirm.message,
                [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', style: 'destructive', onPress: action.onPress },
                ]
            )
            return
        }
        action.onPress?.();
    }

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
    <Menu>
      <MenuTrigger testID={testID} customStyles={{ TriggerTouchableComponent: Pressable }}>
          <ThemedIcon name="dots-vertical"/>
      </MenuTrigger>

      <MenuOptions customStyles={{optionsContainer: [styles.optionsContainer, { backgroundColor: theme.navBackground }]}}>
        {actions
          .filter(action => !action.hidden)
          .map(action => (
            <MenuOption
              key={action.id}
              onSelect={() => handleSelect(action)}
            >
              <View style={styles.option}>
                <ThemedText style={[ action.destructive && { color: Colors.warning }]}>
                  {action.title}
                </ThemedText>

                {action.icon ? (
                  <ThemedIcon
                    name={action.icon}
                    style={[ action.destructive && { color: Colors.warning }]}
                  />
                ) : null}
              </View>
            </MenuOption>
          ))}
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
    optionsContainer: {
        borderRadius: 10,
        paddingVertical: 6,
        width: 190,
        marginTop: 40, // downward offset from the trigger component
    },
    option: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});