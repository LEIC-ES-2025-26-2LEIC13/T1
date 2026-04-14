import React from 'react';
import {Modal, StyleSheet, Keyboard} from 'react-native';
import ThemedView from './ThemedView';

export default function AppModal({ visible, children }) {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <ThemedView
                style={styles.overlay}
                onTouchStart={Keyboard.dismiss}
            >
                {/* MODAL CONTENT */}
                <ThemedView style={styles.container}>
                    {children}
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        borderRadius: 12,
        padding: 20,
    },
});