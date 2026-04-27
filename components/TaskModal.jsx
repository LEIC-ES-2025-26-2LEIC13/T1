import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import ThemedButton from './ThemedButton';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';
import { Colors } from '../constants/Colors';

export default function TaskModal({ visible, onClose, task }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    const description = task?.description?.trim()
        ? task.description
        : 'No description was provided for this task.';

    return (
        <AppModal visible={visible}>

            <ThemedView style={styles.header}>
                <ThemedView style={styles.headerLeft}>
                    <ThemedView style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(70,148,251,0.15)' : 'rgba(70,148,251,0.1)' }]}>
                        <Ionicons name="checkbox-outline" size={20} color="#4694fb" />
                    </ThemedView>
                    <ThemedText title={true} style={[styles.title, { color: theme.text }]}>Task Details</ThemedText>
                </ThemedView>

                <ThemedButton style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                </ThemedButton>
            </ThemedView>

            <ThemedView style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]} />

            <ThemedView style={styles.body}>
                <ThemedView style={styles.sectionCard}>
                    <ThemedText style={styles.sectionLabel}>DESCRIPTION</ThemedText>
                    <ThemedText style={styles.sectionBody}>{description}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.infoGrid}>
                    <ThemedView style={styles.infoCard}>
                        <Ionicons name="pricetag-outline" size={16} color="#4694fb" />
                        <ThemedText style={styles.infoLabel}>LABEL</ThemedText>
                        <ThemedText style={styles.infoValue}>{task?.label || 'None'}</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.infoCard}>
                        <Ionicons name="people-sharp" size={16} color="#4694fb" />
                        <ThemedText style={styles.infoLabel}>ASSIGNED</ThemedText>
                        <ThemedText style={styles.infoValue}>{task?.assignedTo || 'No one'}</ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
            
        </AppModal>
    );
}

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
        flex: 1,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 0,
    },
    divider: {
        height: 1,
    },
    body: {
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    sectionCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(70,148,251,0.08)',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 7,
        color: '#6b7280',
    },
    sectionBody: {
        fontSize: 15,
        lineHeight: 22,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 4,
    },
    infoCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(70,148,251,0.08)',
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    infoValue: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '700',
    },
});