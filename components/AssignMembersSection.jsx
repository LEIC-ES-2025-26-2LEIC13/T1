import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, useColorScheme } from 'react-native';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import ModalBody from './modal/ModalBody';
import ModalActions from './modal/ModalActions';
import ThemedText from './ThemedText';
import ThemedIcon from './ThemedIcon';
import AnimatedPressable from './AnimatedPressable';
import ThemedAlert, { ALERT_TYPES } from './ThemedAlert';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';

export default function AssignMembersSection({
    assignedMembers = [],
    onAssignedMembersChange,
    getProjectUsers,
    visible,
}) {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const [isSelectingMembers, setIsSelectingMembers] = useState(false);
    const [projectMembers, setProjectMembers] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    useEffect(() => {
        if (!visible) setIsSelectingMembers(false);
    }, [visible]);

    const handleOpenAssign = async () => {
        setIsSelectingMembers(true);
        try {
            const users = await getProjectUsers();
            setProjectMembers(users);
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Failed to Load Members", error.message);
        }
    };

    const toggleMember = (member) => {
        const currentlyAssigned = assignedMembers || [];
        const isAssigned = currentlyAssigned.some(m => m.id === member.id);

        let newAssigned;
        if (isAssigned) {
            newAssigned = currentlyAssigned.filter(m => m.id !== member.id);
        } else {
            newAssigned = [...currentlyAssigned, member];
        }
        onAssignedMembersChange(newAssigned);
    };

    const removeMember = (memberId) => {
        const newAssigned = (assignedMembers || []).filter(m => m.id !== memberId);
        onAssignedMembersChange(newAssigned);
    };

    const unselectAllMembers = () => {
        onAssignedMembersChange([]);
    };

    return (
        <>
            <View>
                <ThemedText style={styles.label}>
                    Assigned Members
                </ThemedText>

                <AnimatedPressable
                    testID="open-assign-members-button"
                    onPress={handleOpenAssign}
                    style={[styles.addButton, { borderColor: theme.borders }]}
                >
                    <ThemedIcon name="account-plus" />
                    <ThemedText bold style={{ marginLeft: 8 }}>Add Members</ThemedText>
                </AnimatedPressable>

                {(assignedMembers || []).length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                        {(assignedMembers || []).map(member => (
                            <View key={member.id} style={[styles.assignedTag, { borderColor: theme.borders }]}>
                                <ThemedText style={{ flex: 1 }} numberOfLines={1}>
                                    {member.email === user.email ? "Me" : member.email}
                                </ThemedText>

                                <AnimatedPressable onPress={() => removeMember(member.id)}>
                                    <ThemedIcon name="close" size={16} />
                                </AnimatedPressable>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <AppModal visible={isSelectingMembers} onClose={() => setIsSelectingMembers(false)}>
                <ModalHeader
                    heading="Assign Members"
                    iconName="account-multiple-plus"
                    onClose={() => setIsSelectingMembers(false)}
                />

                <ModalBody>
                    <View style={{ height: 300 }}>
                        <FlatList
                            data={projectMembers}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isAssigned = (assignedMembers || []).some(m => m.id === item.id);
                                return (
                                    <Pressable
                                        onPress={() => toggleMember(item)}
                                        style={[
                                            styles.memberItem,
                                            { borderColor: theme.borders },
                                            isAssigned && { backgroundColor: 'rgba(0,0,0,0.05)' }
                                        ]}
                                    >
                                        <ThemedIcon name="account-circle" style={{ marginRight: 10 }} />
                                        <ThemedText bold style={{ flex: 1 }} numberOfLines={1}>
                                            {item.email === user.email ? "Me" : item.email}
                                        </ThemedText>
                                        {isAssigned && (
                                            <ThemedIcon name="check-circle" style={{ marginLeft: 10 }} />
                                        )}
                                    </Pressable>
                                );
                            }}
                        />
                    </View>
                </ModalBody>

                <ModalActions
                    testID="assign-members-modal-actions"
                    onCancel={() => {
                        setIsSelectingMembers(false);
                        unselectAllMembers();
                    }}
                    secondaryActionName="Go back"
                    primaryActionName="Done"
                    primaryActionIconName="check"
                    onPrimaryActionPress={() => setIsSelectingMembers(false)}
                />
            </AppModal>

            <ThemedAlert
                visible={alertVisible}
                alert={alert}
                onConfirm={() => setAlertVisible(false)}
            />
        </>
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
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10
    },
    assignedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 7,
        opacity: 0.7
    }
});

