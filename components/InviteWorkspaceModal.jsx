import {
    Pressable,
    StyleSheet,
    View,
    Text,
    useColorScheme
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ThemedButton from './ThemedButton';
import AppModal from './AppModal';
import ThemedTextInput from './ThemedTextInput';
import { Colors } from '../constants/Colors';

export default function InviteWorkspaceModal({
    visible,
    value,
    onChangeText,
    onClose,
    onInvite,
    workspaceName,
}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    return (
        <AppModal visible={visible}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconWrap, {
                        backgroundColor: isDark ? 'rgba(70,148,251,0.15)' : 'rgba(70,148,251,0.1)'
                    }]}>
                        <Ionicons name="person-add-outline" size={20} color="#4694fb" />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>Invite Member</Text>
                </View>
                <Pressable
                    onPress={onClose}
                    style={styles.closeBtn}
                    testID="invite-modal-close"
                    accessibilityRole="button"
                    accessibilityLabel="Close invite popup"
                >
                    <Ionicons
                        name="close"
                        size={20}
                        color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                    />
                </Pressable>
            </View>

            {/* Divider */}
            <View style={[styles.divider, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }]} />

            {/* Body */}
            <View style={styles.body}>

                {/* Workspace pill */}
                <View style={[styles.workspacePill, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
                }]}>
                    <Ionicons
                        name="folder-outline"
                        size={13}
                        color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.workspaceName, {
                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
                    }]}>
                        {workspaceName}
                    </Text>
                </View>

                <Text style={[styles.label, {
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'
                }]}>
                    EMAIL ADDRESS
                </Text>

                <ThemedTextInput
                    containerStyle={styles.input}
                    placeholder="Enter user email"
                    value={value}
                    onChangeText={onChangeText}
                    testID="invite-email-input"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <ThemedButton
                    style={[styles.button, styles.cancelBtn]}
                    onPress={onClose}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </ThemedButton>

                <ThemedButton
                    style={[styles.button, styles.inviteBtn, !value.trim() && styles.inviteBtnDisabled]}
                    onPress={onInvite}
                    disabled={!value.trim()}
                >
                    <Ionicons name="paper-plane-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.inviteText}>Send Invite</Text>
                </ThemedButton>
            </View>

        </AppModal>
    );
}

const styles = StyleSheet.create({
    // Header
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
    },

    // Divider
    divider: {
        height: 1,
    },

    // Body
    body: {
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    workspacePill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
        marginBottom: 18,
    },
    workspaceName: {
        fontSize: 13,
        fontWeight: '500',
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 7,
    },
    input: {
        width: '100%',
        marginBottom: 4,
    },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 13,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    inviteBtn: {
        backgroundColor: '#4694fb',
        shadowColor: '#4694fb',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    inviteBtnDisabled: {
        backgroundColor: '#4694fb88',
        shadowOpacity: 0,
        elevation: 0,
    },
    cancelText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 15,
    },
    inviteText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 15,
    },
});