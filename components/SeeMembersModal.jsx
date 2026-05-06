import { FlatList, View, StyleSheet, useColorScheme } from "react-native";
import { useState, useEffect, useCallback } from "react";
import AppModal from "./AppModal";
import { useAuth } from "../hooks/useAuth";
import OverflowMenu from "./OverflowMenu";
import ModalHeader from "./modal/ModalHeader";
import ThemedIcon from "./ThemedIcon";
import ThemedText from "./ThemedText";
import Spacer from "./Spacer";
import { Colors } from "../constants/Colors";


function putCurrUserFirst(userEmail, members) {
    let res = []
    let curUser = null
    for (const member of members) {
        if (member.email === userEmail) curUser = member
        else res.push(member)
    }
    if (!curUser) {
        return res
    }

    res.unshift(curUser) // place the current user in the first position of the new array
    return res
}

export default function SeeMembersModal({visible, getProjectUsers, onClose, onKickMember}) {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [members, setMembers] = useState([]);
    const { user } = useAuth()

    const updateMembers = useCallback(async () => {
        if (visible) {
            try {
                const projectMembers = await getProjectUsers()
                const membersWithCurUserFirst = putCurrUserFirst(user.email, projectMembers)
                setMembers(membersWithCurUserFirst)
            } catch (error) {
                console.error(error.message)
            }
        }
    }, [visible, getProjectUsers, user.email]);

    useEffect(() => {
        updateMembers()
    }, [visible, updateMembers]);

    // Another condition to update the members list (outside the useEffect hook)
    const kickAndUpdate = async (userId, userEmail) => {
        // Run the kick operation, and when done, refresh the state of the modal (the member list) immediately
        await onKickMember(userId, userEmail);
        if (userEmail !== user.email) {
            await updateMembers();
        }
    }

    const MemberList = ({ members }) => {
        return (
        <>
            <FlatList
                data={members}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <>                     
                        <View style={[styles.memberItem, { borderColor: theme.borders }]}>

                            <ThemedIcon
                                name="account-circle"
                                style={{ marginRight: 10 }}
                            />
                            
                            <ThemedText bold style={{ flex: 1 }} numberOfLines={1}>
                                {item.email === user.email ? `Me (${item.email})` : item.email}
                            </ThemedText>
                            
                            <OverflowMenu
                                testID={`overflow-menu-${item.email}`}

                                actions={[
                                    {
                                        id: 'leave-project',
                                        title: 'Leave project',
                                        icon: 'exit-to-app',
                                        confirm: {
                                            title: 'Leave project',
                                            message: `Are you sure you want to leave this project?`
                                        },
                                        destructive: true,
                                        hidden: item.email !== user.email, // only shows this option for the current user
                                        onPress: () => kickAndUpdate(item.id, item.email),
                                    }, 
                                    {
                                        id: 'kick-member',
                                        title: 'Kick member',
                                        icon: 'account-remove',
                                        confirm: {
                                            title: 'Kick member',
                                            message: `Are you sure you want to kick ${item.email} from this project?`
                                        },
                                        destructive: true,
                                        hidden: item.email === user.email,
                                        onPress: () => kickAndUpdate(item.id, item.email),
                                    }
                                ]}
                            />
                        </View>
                    </>
                )}
            />
        </>    
        )
    }


    return (
        <AppModal visible={visible}>

            <ModalHeader
                heading="Project Members"
                iconName="account-multiple"
                onClose={onClose}
            />

            <Spacer height={10} />
            <MemberList members={members}/>
            
        </AppModal>
    );

}

const styles = StyleSheet.create({
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 5,
        paddingHorizontal: 18,
        paddingVertical: 15,
    }
});
