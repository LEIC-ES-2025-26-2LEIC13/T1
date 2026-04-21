import { Alert, FlatList, StyleSheet, View, Text, useColorScheme } from 'react-native';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { useInvite } from '../../../hooks/useInvite';
import ThemedInvite from '../../../components/ThemedInvite';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

const Invites = () => {
    const { invites, acceptInvite, ignoreInvite, setHasNewInvites } = useInvite();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

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
    };

    useFocusEffect(
        useCallback => {
            setHasNewInvites(false)
        }
    )

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="mail-open-outline"
                size={64}
                color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No pending invites
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                When someone invites you to a project, it will appear here
            </Text>
        </View>
    );

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
                ListEmptyComponent={<EmptyState />}
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
    },

    // Empty state
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
    },
});