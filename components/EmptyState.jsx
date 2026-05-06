import { StyleSheet, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedText from './ThemedText'
import ThemedIcon from './ThemedIcon'
import { Colors } from '../constants/Colors'

const EmptyState = ({ title, subtitle, iconName}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View style={styles.emptyContainer}>
            <ThemedIcon
                name={iconName}
                size={64}
                color={theme.borders}
            />

            <ThemedText title style={styles.emptyTitle}>
                {title}
            </ThemedText>

            <ThemedText style={styles.emptySubtitle}>
                {subtitle}
            </ThemedText>
        </View>
    )
}

export default EmptyState

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 20,
    }
})