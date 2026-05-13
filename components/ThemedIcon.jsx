import { useColorScheme } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';


const ThemedIcon = ({name, size=22, onPrimary=false, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    
    return (
        <MaterialCommunityIcons 
            name={name} 
            size={size} 
            color={onPrimary ? theme.onPrimary : theme.iconColor}
            {...props}
        />
    )
}

export default ThemedIcon
