import { StyleSheet, ScrollView } from 'react-native'
import React from 'react'

const PillsContainer = ({ style, children }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.pillsContainer, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {children}    
    </ScrollView>
  )
}

export default PillsContainer

const styles = StyleSheet.create({
    pillsContainer: {
        flexGrow: 0,
    },
    contentContainer: {
        gap: 10,
        paddingHorizontal: 0
    }
})