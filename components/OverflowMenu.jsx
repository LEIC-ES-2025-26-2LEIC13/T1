import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

export default function OverflowMenu({ actions = [], iconColor = '#111', menuOffset = 0 }) {
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
      );
      return;
    }

    action.onPress?.();
  };

  return (
    <Menu>
      <MenuTrigger customStyles={{ TriggerTouchableComponent: Pressable }}>
        <View
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={iconColor} />
        </View>
      </MenuTrigger>

      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 12,
            paddingVertical: 6,
            width: 190,
            marginTop: menuOffset, // Downward offset from the trigger component
          },
        }}
      >
        {actions
          .filter(action => !action.hidden)
          .map(action => (
            <MenuOption
              key={action.id}
              onSelect={() => handleSelect(action)}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: action.destructive ? '#d11a2a' : '#111',
                  }}
                >
                  {action.title}
                </Text>

                {action.icon ? (
                  <Ionicons
                    name={action.icon}
                    size={18}
                    color={action.destructive ? '#d11a2a' : '#666'}
                  />
                ) : null}
              </View>
            </MenuOption>
          ))}
      </MenuOptions>
    </Menu>
  );
}