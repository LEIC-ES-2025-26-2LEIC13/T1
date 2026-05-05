import { FlatList, StyleSheet, View, Text, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedView from '../../../components/ThemedView';
import ThemedInvite from '../../../components/ThemedInvite';
import EmptyState from '../../../components/EmptyState';
import ThemedAlert, { ALERT_TYPES } from '../../../components/ThemedAlert';
import { useInvite } from '../../../hooks/useInvite';

const Invites = () => {
    const { invites, acceptInvite, ignoreInvite, setHasNewInvites } = useInvite();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    const handleAccept = async (invite) => {
        try {
          	await acceptInvite(invite)
        } catch (error) {
          	showAlert(ALERT_TYPES.ERROR, 'Accept Invite Failed', error.message)
        }
    };

    const handleIgnore = async (invite) => {
        try {
            await ignoreInvite(invite)
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, 'Ignore Invite Failed', error.message)
        }
    }

    useFocusEffect(
        useCallback => {
            setHasNewInvites(false)
        }
    )

    return (
        <ThemedView style={styles.container}>

            {/* Invite count pill */}
            {invites && invites.length > 0 && (
                <View style={styles.countRow}>
                    <View style={[styles.countPill, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                    }]}>
                        <Ionicons
                            name="mail-outline"
                            size={13}
                            color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.countText, {
                            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
                        }]}>
                            {invites.length} pending {invites.length === 1 ? 'invite' : 'invites'}
                        </Text>
                    </View>
                </View>
            )}

            <FlatList
                data={invites}
                keyExtractor={(item) => item.id}

                contentContainerStyle={[
                    styles.list,
                    (!invites || invites.length === 0) && styles.listEmpty
                ]}

                showsVerticalScrollIndicator={false}

                ListEmptyComponent={<EmptyState 
                    title="No pending invites" 
                    subtitle="When someone invites you to a project, it will appear here" 
                    iconName="email-open-outline" />
                }

                renderItem={({ item }) => (
					<ThemedInvite
						projectName={item.projectName}
						sender={item.senderEmail}
						onAccept={() => handleAccept(item)}
						onIgnore={() => handleIgnore(item)}
					/>
                )}
            />

            <ThemedAlert 
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)} 
            />
        </ThemedView>
    );
};

export default Invites;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Count pill
    countRow: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 4,
        alignItems: 'flex-start',
    },
    countPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
    },
    countText: {
        fontSize: 13,
        fontWeight: '500',
    },

    // List
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    listEmpty: {
        flex: 1,
    }
});