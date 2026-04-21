import { Text, StyleSheet, View, useColorScheme } from 'react-native';
import AppModal from './AppModal';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';
import ThemedTextInput from './ThemedTextInput';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectModal({
    visible,
    onClose,
    onCreate,
    titleValue,
    onTitleChangeText,
    descriptionValue,
    onDescriptionChangeText,
}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    return (
        <AppModal visible={visible}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(70,148,251,0.15)' : 'rgba(70,148,251,0.1)' }]}>
                        <Ionicons name="folder-open-outline" size={20} color="#4694fb" />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>New Project</Text>
                </View>
                <ThemedButton style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                </ThemedButton>
            </View>

            {/* Divider */}
            <View style={[styles.divider, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }]} />

            {/* Fields */}
            <View style={styles.body}>
                <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }]}>
                    PROJECT TITLE
                </Text>
                <ThemedTextInput
                    containerStyle={styles.input}
                    placeholder="Enter project title"
                    value={titleValue}
                    onChangeText={onTitleChangeText}
                />

                <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }]}>
                    DESCRIPTION
                </Text>
                <ThemedTextInput
                    containerStyle={[styles.input, styles.textArea]}
                    placeholder="Enter project description (optional)"
                    multiline={true}
                    value={descriptionValue}
                    onChangeText={onDescriptionChangeText}
                />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <ThemedButton
                    style={[styles.button, styles.cancelBtn, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                    }]}
                    onPress={onClose}
                >
                    <Text style={[styles.cancelText, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                        Cancel
                    </Text>
                </ThemedButton>

                <ThemedButton
                    style={[styles.button, styles.createBtn]}
                    onPress={() => onCreate({ title: titleValue, description: descriptionValue })}
                >
                    <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.createText}>Create</Text>
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
        backgroundColor: 'transparent',
        padding: 0,
    },

    // Divider
    divider: {
        height: 1,
        marginHorizontal: 0,
    },

    // Body
    body: {
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 7,
    },
    input: {
        width: '100%',
        marginBottom: 18,
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 4,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 13,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        // background set inline for theme support
    },
    createBtn: {
        backgroundColor: '#4694fb',
        shadowColor: '#4694fb',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    cancelText: {
        fontWeight: '600',
        fontSize: 15,
    },
    createText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 15,
    },
});