import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList, useColorScheme } from 'react-native';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import Pill from './modal/Pill';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import PillsContainer from './modal/PillsContainer';
import Labels from './modal/Labels';
import ModalActions from './modal/ModalActions';
import ThemedText from './ThemedText';
import ThemedIcon from './ThemedIcon';
import Spacer from './Spacer';
import { useAuth } from '../hooks/useAuth';
import { LABELS } from '../constants/Labels';
import { Colors } from '../constants/Colors';


export default function CreateTaskModal({
    visible,
    projectName,
    columnName,
    onClose,
    onCreate,
    task,
    onChange,
    getProjectUsers,
}) {
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const isPreset = LABELS.some(label => label.name === task.label);

    // Assignment UI State
    const [isSelectingMembers, setIsSelectingMembers] = useState(false);
    const [projectMembers, setProjectMembers] = useState([]);

    useEffect(() => {
        if (!visible) setIsSelectingMembers(false);
    }, [visible]);

    // Changes the modal form the AddTask to Assign Users
    const handleOpenAssign = async () => {
        setIsSelectingMembers(true);
        try {
            const users = await getProjectUsers();
            // exclude current user from assignables if you want, or keep logic simple
            const others = users.filter(m => m.email !== user.email);
            setProjectMembers(others);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleMember = (member) => {
        const currentlyAssigned = task.assignedMembers || [];
        const isAssigned = currentlyAssigned.some(m => m.id === member.id);

        let newAssigned;
        if (isAssigned) {
            newAssigned = currentlyAssigned.filter(m => m.id !== member.id);
        } else {
            newAssigned = [...currentlyAssigned, member];
        }
        onChange('assignedMembers', newAssigned);
    };

    const removeMember = (memberId) => {
        const newAssigned = (task.assignedMembers || []).filter(m => m.id !== memberId);
        onChange('assignedMembers', newAssigned);
    }

    const handleCreateWrapper = () => {
        if (!task.name || !task.name.trim()) {
            alert('Task name is required');
            return;
        }
        onCreate(task);
    };

    return (
        <AppModal visible={visible}>
            {isSelectingMembers ? (
                <>
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
                                    const isAssigned = (task.assignedMembers || []).some(m => m.id === item.id);
                                    return (
                                        <Pressable
                                            onPress={() => toggleMember(item)}
                                            style={[
                                                styles.memberItem,
                                                { borderColor: theme.borders },
                                                isAssigned && { backgroundColor: theme.borderHover || 'rgba(0,0,0,0.05)' }
                                            ]}
                                        >
                                            <ThemedIcon name="account-circle" style={{ marginRight: 10 }} />
                                            <ThemedText bold style={{ flex: 1 }} numberOfLines={1}>
                                                {item.email}
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
                        onCancel={() => setIsSelectingMembers(false)}
                        primaryActionName="Done"
                        primaryActionIconName="check"
                        onPrimaryActionPress={() => setIsSelectingMembers(false)}
                    />
                </>
            ) : (
                <>
                    <ModalHeader
                        heading="Add Task"
                        iconName="note-plus"
                        onClose={onClose}
                    />

                    <View style={{ maxHeight: 500 }}>
                        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                            <ModalBody>

                                <PillsContainer>
                                    <Pill projectName={projectName}/>
                                    <Pill columnName={columnName}/>
                                </PillsContainer>

                                <FormField
                                    labelName="TASK NAME"
                                    placeholder="Enter task name"
                                    value={task.name}
                                    onChangeText={(value) => onChange('name', value)}
                                />

                                <FormField
                                    labelName="DESCRIPTION"
                                    placeholder="Enter task description (optional)"
                                    value={task.description}
                                    onChangeText={(value) => onChange('description', value)}
                                    multiline
                                />

                                <FormField
                                    labelName="LABELS"
                                    placeholder="Enter or select label"
                                    value={isPreset ? "" : task.label}
                                    onChangeText={(text) => onChange('label', text)}
                                />

                                <Labels
                                    labels={LABELS}
                                    currentLabel={task.label}
                                    onChange={onChange}
                                />
                                
                                <Spacer height={20} />
                                
                                <ThemedText bold style={{ marginBottom: 10 }}>ASSIGNED MEMBERS</ThemedText>
                                <Pressable 
                                    onPress={handleOpenAssign}
                                    style={[styles.addButton, { borderColor: theme.borders }]}
                                >
                                    <ThemedIcon name="account-plus" />
                                    <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>Add Members</ThemedText>
                                </Pressable>

                                {(task.assignedMembers || []).length > 0 && (
                                    <View style={{ marginTop: 10 }}>
                                        {(task.assignedMembers || []).map(member => (
                                            <View key={member.id} style={[styles.assignedTag, { borderColor: theme.borders }]}>
                                                <ThemedText style={{ flex: 1 }} numberOfLines={1}>{member.email}</ThemedText>
                                                <Pressable onPress={() => removeMember(member.id)} hitSlop={10}>
                                                    <ThemedIcon name="close" size={16} />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                
                                <Spacer height={10} />
                            </ModalBody>
                        </ScrollView>
                    </View>

                    <ModalActions
                        onCancel={onClose}
                        primaryActionName="Add"
                        primaryActionIconName="plus"
                        onPrimaryActionPress={handleCreateWrapper}
                    />
                </>
            )}
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
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    assignedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 6,
    }
});
