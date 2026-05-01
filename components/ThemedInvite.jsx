import { StyleSheet, View, useColorScheme } from 'react-native'
import { Colors } from "../constants/Colors"
import ThemedText from './ThemedText'
import ThemedButton from './ThemedButton'

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

            <View style={styles.buttons}>
                <ThemedButton style={[styles.button, { backgroundColor: Colors.warning } ]} onPress={onIgnore}>
                    <ThemedText title={true} style={styles.buttonText}>Ignore</ThemedText>
                </ThemedButton>

                <ThemedButton style={[styles.button, styles.accept]} onPress={onAccept}>
                    <ThemedText title={true} style={styles.buttonText}>Accept</ThemedText>
                </ThemedButton>
            </View>
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
        fontSize: 12,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    value: {
        fontSize: 15,
        marginBottom: 8,
    },

    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
    },
})