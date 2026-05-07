import { StyleSheet, View, useColorScheme } from 'react-native'
import { Colors } from "../constants/Colors"
import ThemedText from './ThemedText'
import ModalActions from './modal/ModalActions'

const ThemedInvite = ({ projectName, sender, onAccept, onIgnore }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light



    return (
        <View style={[styles.card, { backgroundColor: theme.navBackground }] }>
            <View style={styles.content}>
                <ThemedText style={styles.label}>Project</ThemedText>
                <ThemedText testID="project-title" style={styles.value}>{projectName}</ThemedText>

                <ThemedText style={styles.label}>Invited by</ThemedText>
                <ThemedText style={styles.value}>{sender}</ThemedText>
            </View>

            <ModalActions
                onCancel={onIgnore}
                primaryActionName="Accept"
                primaryActionIconName="check"
                onPrimaryActionPress={onAccept}
                secondaryActionName="Ignore"
                customStyle={{ paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 }}
            />
        </View>
    )
}

export default ThemedInvite

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 0.2,
        padding: 16,
        gap: 14,
    },

    content: {
        gap: 4,
    },

    buttons: {
        flexDirection: 'row',
        gap: 12
    },

    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform:  'uppercase',
        opacity: 0.7
    },

    value: {
        fontSize: 15,
        marginBottom: 8,
    },

    button: {
        flex: 1,
    }
})