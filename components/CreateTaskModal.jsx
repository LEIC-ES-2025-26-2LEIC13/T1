import { Text, StyleSheet, View, Pressable } from 'react-native';
import AppModal from './AppModal';
import ThemedText from "./ThemedText";
import Spacer from "./Spacer";
import ThemedButton from "./ThemedButton";
import ThemedView from "./ThemedView";
import ThemedTextInput from "./ThemedTextInput";

// Example of labels for the task
const LABELS = ["Work", "Urgent", "Idea"];

export default function CreateTaskModal({
    isVisible,
    onClose,
    onCreate,
    titleValue,
    onTitleChangeText,
    descriptionValue,
    onDescriptionChangeText,
    labelValue,
    onLabelChangeText,
    projectName,
}) {
    const isPreset = LABELS.includes(labelValue);

    return (
        <AppModal visible={isVisible}>

            <ThemedText title={true} style={styles.title}>
                Create Task - {projectName}
            </ThemedText>

            <ThemedText title={true}>Task Name</ThemedText>
            <Spacer height={10}/>

            <ThemedTextInput
                style={{width: '100%', marginBottom: 15}}
                placeholder="Enter task name"

                value={titleValue}
                onChangeText={onTitleChangeText}
            />

            <ThemedText title={true}>Description</ThemedText>
            <Spacer height={10}/>

            <ThemedTextInput
                style={{width: '100%', marginBottom: 15, height: 100, textAlignVertical: 'top'}}
                placeholder="Enter task description"
                multiline={true}

                value={descriptionValue}
                onChangeText={onDescriptionChangeText}
            />

            {/* Label input */}
            <View style={styles.labelContainer}>
                {LABELS.map((label) => {
                    const selected = labelValue === label
                    return (
                        <Pressable
                            key={label}
                            onPress={() => onLabelChangeText(label)}
                            style={[
                                styles.labelChip,
                                selected && styles.labelChipSelected
                            ]}
                        >
                            <Text
                                style={[
                                    styles.labelText,
                                    selected && styles.labelTextSelected
                                ]}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Custom Label Input, will change in the future*/}
            <ThemedTextInput
                style={[
                    styles.customInput,
                    !isPreset && labelValue !== "" && styles.customInputActive
                ]}
                placeholder="Or type custom label..."
                value={isPreset ? "" : labelValue}
                onChangeText={onLabelChangeText}
            />

            <ThemedView style={styles.actions}>
                <ThemedButton style={[styles.button,styles.cancel]} onPress={onClose}>
                    <Text style={styles.buttonTextCancel}>Cancel</Text>
                </ThemedButton>

                <ThemedButton style={[styles.button]} 
                    onPress={() => onCreate({ name: titleValue, description: descriptionValue, label: labelValue })}
                >
                    <Text style={styles.buttonTextCreate}>Create Task</Text>
                </ThemedButton>
            </ThemedView>

        </AppModal>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20,
    },

    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
        marginHorizontal: 5,
    },

    cancel: {
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: 'grey',
    },

    buttonTextCancel: {
        color: 'black',
        fontWeight: 'bold',
    },

    buttonTextCreate: {
        color: 'white',
        fontWeight: 'bold',
    },
    labelContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 15,
    },

    labelChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "transparent",
    },

    labelChipSelected: {
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5",
    },

    labelText: {
        fontSize: 13,
        color: "#333",
    },

    labelTextSelected: {
        color: "white",
        fontWeight: "600",
    },

    customInput: {
        width: '100%',
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    customInputActive: {
        borderColor: '#4F46E5',
    },
});
