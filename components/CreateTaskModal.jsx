import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList, useColorScheme } from 'react-native';
import AppModal from './AppModal';
import ModalHeader from './modal/ModalHeader';
import Pill from './Pill';
import ModalBody from './modal/ModalBody';
import FormField from './FormField';
import PillsContainer from './PillsContainer';
import ModalActions from './modal/ModalActions';
import ThemedText from './ThemedText';
import ThemedIcon from './ThemedIcon';
import { useAuth } from '../hooks/useAuth';
import { LABELS } from '../constants/Labels';
import { LabelColors, Colors } from '../constants/Colors';
import AnimatedPressable from './AnimatedPressable';
import ThemedAlert, { ALERT_TYPES } from './ThemedAlert';


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
    const { user } = useAuth()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alert, setAlert] = useState({ type: '', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setAlertVisible(true);
    };

    const isPreset = LABELS.some(label => label.name === task.label)

    const labels = (
        <PillsContainer style={{ marginBottom: 15 }}>
            {LABELS.map((label) => {
                const isSelected = (task.label === label.name)
                const labelColor = LabelColors[label.name] || LabelColors.default;

                return (
                    <Pill
                        key={label.name}
                        name={label.name}
                        iconName={label.icon}
                        pressable
                        onPress={() => onChange('label', isSelected ? '' : label.name)}
                        customStyle={isSelected && { backgroundColor: `${labelColor}50` }}
                    />
                );
            })}
        </PillsContainer>
    )

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
        } catch (error) {
            showAlert(ALERT_TYPES.ERROR, "Failed to Load Members", error.message)
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
        onCreate(task);
    };

    const selectedMembersModal = (
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
                                        isAssigned && { backgroundColor: 'rgba(0,0,0,0.05)' }
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
                testID="assign-members-modal-actions"
                onCancel={() => setIsSelectingMembers(false)}
                primaryActionName="Done"
                primaryActionIconName="check"
                onPrimaryActionPress={() => setIsSelectingMembers(false)}
            />
        </>
    )

    const notSelectedMembersModal = (
         <>
            <ModalHeader
                heading="Create Task"
                iconName="note-plus"
                onClose={onClose}
            />

            <View style={{ maxHeight: 500 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ModalBody>

                        <PillsContainer style={{ marginBottom: 15 }}>
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
            
            
                        {labels}
                        
                        <ThemedText style={[styles.label]}>
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

                        {(task.assignedMembers || []).length > 0 && (
                            <View style={{ marginBottom: 15 }}>
                                {(task.assignedMembers || []).map(member => (
                                    <View key={member.id} style={[styles.assignedTag, { borderColor: theme.borders }]}>
                                        <ThemedText style={{ flex: 1 }} numberOfLines={1}>{member.email}</ThemedText>

                                        <AnimatedPressable onPress={() => removeMember(member.id)} >
                                            <ThemedIcon name="close" size={16} />
                                        </AnimatedPressable>
                                    </View>
                                ))}
                            </View>
                        )}
                        
                    </ModalBody>
                </ScrollView>
            </View>

            <ModalActions
                testID="create-task-modal-actions"
                onCancel={onClose}
                primaryActionName="Create"
                primaryActionIconName="plus"
                onPrimaryActionPress={handleCreateWrapper}
                primaryActionDisabled={!task.name.trim()} // .trim() to ignore whitespace
                secondaryActionName="Close"
            />
        </>
    )

    return (
        <>
            <AppModal visible={visible} onClose={isSelectingMembers ? () => setIsSelectingMembers(false) : onClose}>
                {isSelectingMembers ? selectedMembersModal : notSelectedMembersModal}
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
