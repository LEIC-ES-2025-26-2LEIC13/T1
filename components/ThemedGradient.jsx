import { StyleSheet, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'

const ThemedGradient = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <LinearGradient
            colors={ colorScheme === "dark" ?
                [Colors.primary, theme.navBackground] :
                [theme.navBackground, Colors.primary]
            }
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
    )
}

export default ThemedGradient
