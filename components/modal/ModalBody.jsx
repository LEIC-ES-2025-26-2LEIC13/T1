import { StyleSheet, View } from 'react-native'
import React from 'react'

const ModalBody = ({ children }) => {
    return (
        <View style={styles.body}>
            {children}
        </View>
    )
}

export default ModalBody

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: 20,
        paddingTop: 18,
    }
})