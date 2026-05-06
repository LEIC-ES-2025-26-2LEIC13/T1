import { Image, StyleSheet, useColorScheme } from 'react-native'
import React from 'react'

const ThemedLogo = () => {
    const colorScheme = useColorScheme()

    return (
        <Image
            source={ colorScheme === "light" ? require("../assets/leico_light.png") : require("../assets/leico_dark.png") }
            style={styles.logo}
            resizeMode="contain"
        />
    )
}

export default ThemedLogo

const styles = StyleSheet.create({
    logo: {
        width: 180,
        height: 180,
        marginBottom: 24,
    }
})