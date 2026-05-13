import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedButton from '../ThemedButton';
import { Colors } from '../../constants/Colors';
import ThemedIcon from '../ThemedIcon';
import Divider from '../Divider';

const ModalHeader = ({heading, iconName, onClose }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconWrap, { backgroundColor: Colors.primary }]}>
                        <ThemedIcon name={iconName} onPrimary/>
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>{heading}</Text>
                </View>
                <ThemedButton style={styles.closeBtn} onPress={onClose}>
                    <ThemedIcon name="close" />
                </ThemedButton>
            </View>

            <Divider/>
        </>
    )
}

export default ModalHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 0,
    }
})