import { StyleSheet, View } from 'react-native'
import React from 'react'
import ThemedLogo from '../ThemedLogo'
import ThemedText from '../ThemedText'

const BrandingContainer = ({ style }) => {
    return (
        <View style={[{ alignItems: 'center' }, style]}>
            <ThemedLogo/>
            <ThemedText title style={styles.slogan}>From students to students</ThemedText>
        </View>
    )
}

export default BrandingContainer

const styles = StyleSheet.create({
    slogan: {
        fontSize: 18,
        letterSpacing: 0.5,
        marginTop: -20,
        fontStyle: 'italic',
        opacity: 0.8
    }
})