import { useColorScheme, FlatList, View, Pressable, StyleSheet, Text } from "react-native";
import { useState, useEffect } from "react";
import { Colors } from "../constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import AppModal from "./AppModal";
import { useAuth } from "../hooks/useAuth";


function putCurrUserFirst(userEmail, members) {
    let res = []
    let curUser = null
    for (const member of members) {
        if (member.email === userEmail) curUser = member
        else res.push(member)
    }
    if (!curUser) {
        throw new Error('The current user does not belong to this project')
    }

    res.unshift(curUser) // place the current user in the first position of the new array
    return res
}

export default function SeeMembersModal({
    visible,
    getProjectUsers,
    onClose,
}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    const [members, setMembers] = useState([]);
    const { user } = useAuth()

    useEffect(() => {

        async function auxGetUsers() {
            if (visible) {
                try {
                    const projectUsers = await getProjectUsers()
                    const membersWithCurUserFirst = putCurrUserFirst(user.email, projectUsers)
                    setMembers(membersWithCurUserFirst)
                } catch (error) {
                    console.error(error.message)
                }
            }
        }

        auxGetUsers() // necessary because of warnings
        
    }, [visible, getProjectUsers, user.email]);
    

    return (
        <AppModal visible={visible}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconWrap, {
                        backgroundColor: isDark ? 'rgba(70,148,251,0.15)' : 'rgba(70,148,251,0.1)'
                    }]}>
                        <Ionicons name="people-outline" size={20} color="#4694fb" />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>Project Members</Text>
                </View>
                <Pressable
                    onPress={onClose}
                    style={styles.closeBtn}
                    testID="see-members-close"
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
            <FlatList
                contentContainerStyle={styles.body}
                data={members}
                keyExtractor={(item) => item.id?.toString() || item.email}
                renderItem={({ item }) => (
                    <View style={[styles.memberItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons 
                            name="person-circle-outline" 
                            size={22} 
                            color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'}
                            style={{ marginRight: 10 }}
                        />
                        <Text style={[styles.memberEmail, { color: theme.text }]}>
                            {item.email === user.email ? `Me (${item.email})` : item.email}
                        </Text>
                    </View>
                )}
            />
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
        paddingVertical: 10,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    memberEmail: {
        fontSize: 15,
        fontWeight: '500',
    },
});
