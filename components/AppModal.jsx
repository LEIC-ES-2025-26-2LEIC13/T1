import React from 'react';
import {Modal, StyleSheet, Keyboard, View} from 'react-native';
import ThemedView from './ThemedView';
import { MenuProvider } from 'react-native-popup-menu';

export default function AppModal({ visible, children, onClose }) {
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <MenuProvider skipInstanceCheck>
                <View
                    style={styles.overlay}
                    onTouchStart={Keyboard.dismiss}
                >
                    {/* MODAL CONTENT */}
                    <ThemedView style={styles.container}>
                        {children}
                    </ThemedView>
                </View>
            </MenuProvider>
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