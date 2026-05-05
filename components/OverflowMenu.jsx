import React, { useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import ThemedIcon from './ThemedIcon';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import ThemedAlert, { ALERT_TYPES } from './ThemedAlert';

export default function OverflowMenu({ testID, actions = [] }) {

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });
    const [currentAction, setCurrentAction] = useState(null); // used to store the action that triggered the alert, so that it can be executed if the user confirms the alert

    const showAlert = (type, title, message, action) => { // function to call when an alert needs to be shown
        setAlert({ type, title, message });
        setCurrentAction(action); // store the current action
        setAlertVisible(true);
    };

    // If inside the actions passed there is a confirmation step, for example, upon deletion of a project, the 
    // user is reprompted to be sure of his operation
    const handleSelect = (action) => { 
        if (action.confirm) {
            showAlert(ALERT_TYPES.INFO, action.confirm.title, action.confirm.message, action);
        }
        else {
            action.onPress();
        }
    }

    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
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

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => {
                    setAlertVisible(false);
                    currentAction.onPress();
                    setCurrentAction(null); // reset current action
                }}
                onCancel={() => {
                    setAlertVisible(false);
                    setCurrentAction(null); // reset current action
                }}
            />
        </>
  )
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