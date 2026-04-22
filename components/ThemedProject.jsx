import { StyleSheet, useColorScheme, Pressable, View, Text, Platform, TouchableNativeFeedback } from 'react-native'
import { Colors } from "../constants/Colors";
import ThemedText from "./ThemedText";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

const ThemedProject = ({ name, description, borderColor, href, projectId, testID }) => {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const isDark = colorScheme === 'dark'

    const handlePress = () => {
        if (projectId) {
            router.push({ pathname: '/project', params: { projectId } })
        }
    }

    const gradientColors = [borderColor, `${borderColor}22`]

    const CardContent = (
        <View>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentBar}
            />
            <View style={styles.content}>
                <ThemedText title={true} style={styles.name}>{name}</ThemedText>

                {description ? (
                    <ThemedText style={[
                        styles.description,
                        { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }
                    ]}>
                        {description}
                    </ThemedText>
                ) : null}

                <View style={styles.footer}>
                    <Text style={[styles.openLabel, { color: borderColor }]}>Open →</Text>
                </View>
            </View>
        </View>
    )

    if (Platform.OS === 'android') {
        return (
            <View style={styles.container}>
                <View style={[styles.cardInner, { backgroundColor: theme.navBackground }]}>
                    <TouchableNativeFeedback
                        onPress={handlePress}
                        testID={testID}
                        background={TouchableNativeFeedback.Ripple(`${borderColor}33`, false)}
                    >
                        {CardContent}
                    </TouchableNativeFeedback>
                </View>
            </View>
        )
    }

    return (
        <Pressable
            onPress={handlePress}
            testID={testID}
            style={({ pressed }) => [
                styles.container,
                {
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                }
            ]}
        >
            <View style={[styles.cardInner, { backgroundColor: theme.navBackground }]}>
                {CardContent}
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    cardInner: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    accentBar: {
        height: 5,
        width: '100%',
    },

    content: {
        padding: 16,
    },

    name: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
        marginBottom: 6,
    },

    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    openLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
})

export default ThemedProject