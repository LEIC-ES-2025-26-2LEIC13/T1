import { Alert, FlatList, StyleSheet } from 'react-native';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useInvite } from '../../../hooks/useInvite';
import ThemedInvite from '../../../components/ThemedInvite';

const Invites = () => {
    const { invites, acceptInvite, ignoreInvite } = useInvite();

    const handleAccept = async (invite) => {
        try {
          await acceptInvite(invite.id, invite.projectId, invite.receiverId)
        } catch {
          Alert.alert('Error', 'Could not accept invite.')
        }
    };

		const handleIgnore = async (invite) => {
			try {
				await ignoreInvite(invite.id)
			} catch {
				Alert.alert('Error', 'Could not ignore invite')
			}
		}

    return(
        <ThemedView style={styles.container}>

            <FlatList
                data={invites}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <ThemedText style={styles.blankText}>No pending invites.</ThemedText>
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
			paddingBottom: 32
		},

		blankText: {
			textAlign: 'center',
			marginTop: 20,

			fontSize: 16,
			fontWeight: 'bold',
			opacity: 0.7
		}
});