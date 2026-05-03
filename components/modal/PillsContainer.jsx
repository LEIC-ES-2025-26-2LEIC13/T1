import { StyleSheet, View } from 'react-native'
import React from 'react'

const PillsContainer = ({ children }) => {
  return (
    <View style={styles.pillsContainer}>
      {children}    
    </View>
  )
}

export default PillsContainer

const styles = StyleSheet.create({
    pillsContainer: {
        flexDirection: 'row',
        gap: 10
    }
})