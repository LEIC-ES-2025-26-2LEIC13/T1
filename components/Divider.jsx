import { StyleSheet, useColorScheme, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

const Divider = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
      <View style={[styles.divider, {
            backgroundColor: theme.borders
      }]}
      />
    )
}

export default Divider

const styles = StyleSheet.create({
    // Divider
    divider: {
        height: 1,
        marginHorizontal: 0,
    }
})