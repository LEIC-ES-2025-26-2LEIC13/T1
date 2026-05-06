import { FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import ThemedView from '../../../components/ThemedView';
import ThemedInvite from '../../../components/ThemedInvite';
import EmptyState from '../../../components/EmptyState';
import ThemedAlert, { ALERT_TYPES } from '../../../components/ThemedAlert';
import { useInvite } from '../../../hooks/useInvite';
import Pill from '../../../components/modal/Pill';

const Invites = () => {
    const { invites, acceptInvite, ignoreInvite, setHasNewInvites } = useInvite();

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

            <FlatList
                ListHeaderComponent={
                    <Pill
                        name={`${invites.length} pending ${invites.length === 1 ? 'invite' : 'invites'}`}
                        iconName="email-outline"
                    />
                }

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
        paddingHorizontal: 16
    },
    
    list: {
        paddingVertical: 16,
    },
    
    listEmpty: {
        flex: 1,
    }
});