import { Alert, FlatList, StyleSheet, View } from 'react-native';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedButton from '../../../components/ThemedButton';
import { useInvite } from '../../../hooks/useInvite';

const Invites = () => {
    const { invites, acceptInvite } = useInvite();

    const handleAccept = async (invite) => {
        try {
            await acceptInvite(invite.id, invite.projectId, invite.receiverId);
        } catch {
            Alert.alert('Error', 'Could not accept invite.');
        }
    };

    return(
        <ThemedView style={styles.container}>

            <FlatList
                data={invites}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>No pending invites.</ThemedText>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <ThemedText title={true}>{item.projectName}</ThemedText>
                        <ThemedText>From: {item.senderEmail}</ThemedText>
                        <ThemedButton onPress={() => handleAccept(item)} style={styles.button}>
                            <ThemedText style={styles.buttonText}>Accept</ThemedText>
                        </ThemedButton>
                    </View>
                )}
            />
        </ThemedView>
    )
}

export default Invites

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyText: {
        marginTop: 24,
        textAlign: 'center',
        opacity: 0.7,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    button: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
    }
});