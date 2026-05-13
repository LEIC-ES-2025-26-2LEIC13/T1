import { Keyboard, StyleSheet, ScrollView } from 'react-native'
import React from 'react'

const AuthBody = ({  style, children }) => {
  return (
    <ScrollView
        contentContainerStyle={[styles.scrollContent, style]}
        scrollEnabled={false}
        onTouchStart={Keyboard.dismiss}
    >
      {children}
    </ScrollView>
  )
}

export default AuthBody

const styles = StyleSheet.create({
     scrollContent: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        paddingHorizontal: 30
    }
})