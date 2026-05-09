import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import ThemedIcon from './ThemedIcon';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import ThemedAlert, { ALERT_TYPES } from './ThemedAlert';
import Divider from './Divider';
import Spacer from './Spacer';
import AnimatedPressable from './AnimatedPressable';

export default function OverflowMenu({ testID, actions = [], customColor }) {

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
    const filteredActions = actions.filter(action => !action.hidden)

    return (
        <>
            <Menu>
            <MenuTrigger testID={testID} customStyles={{ TriggerTouchableComponent: AnimatedPressable }}>
                <ThemedIcon name="dots-vertical"/>
            </MenuTrigger>

            <MenuOptions customStyles={{optionsContainer: [styles.optionsContainer, { 
                backgroundColor: customColor ?? theme.navBackground,
                borderColor: theme.borders
                }]}}>
                {filteredActions.map((action, index) => (
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
                        {index < filteredActions.length - 1 && (
                            <>
                                <Spacer height={5} />
                                <Divider />
                            </>
                        )}
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
        borderWidth: 1,
        paddingHorizontal: 14,
        borderRadius: 10,
        paddingVertical: 6,
        width: 190,
        marginTop: 40, // downward offset from the trigger component
    },
    option: {
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});