import { StyleSheet, View, ActivityIndicator } from 'react-native'
import React from 'react'
import ThemedView from './ThemedView'
import ThemedText from './ThemedText'
import { Colors } from '../constants/Colors'

const LoadingScreen = () => {
    return (
        <View style={[styles.loadingOverlay, StyleSheet.absoluteFill]}>
            <ThemedView style={styles.loadingCard}>
                <ActivityIndicator size='large' color={ Colors.primary } />
                <ThemedText bold style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        </View>
    )
}

export default LoadingScreen

const styles = StyleSheet.create({
    loadingOverlay: {
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        paddingVertical: 35,
        paddingHorizontal: 40,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    loadingText: {
        marginTop: 18,
        fontSize: 16,
        letterSpacing: 1,
    }
})
