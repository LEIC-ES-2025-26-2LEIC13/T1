import { StyleSheet, useColorScheme, View, Text } from 'react-native'
import { Colors } from "../constants/Colors";
import ThemedText from "./ThemedText";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import ThemedIcon from './ThemedIcon';
import AnimatedPressable from './AnimatedPressable';

const ThemedProject = ({ name, description, borderColor, href, projectId, testID, onLongPress }) => {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const handlePress = () => {
        if (href) {
            router.push(href)
            return
        }

        if (projectId) {
            router.push({ pathname: '/project', params: { projectId } })
        }
    }

    const gradientColors = [borderColor, `${borderColor}55`]

    const CardContent = (
        <View style={[styles.card, { backgroundColor: theme.navBackground }]}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentBar}
            />
            <View style={styles.content}>
                <ThemedText title bold style={styles.name}>
                    {name}
                </ThemedText>

                {description ? (
                    <ThemedText style={styles.description}>
                        {description}
                    </ThemedText>
                ) : null}

                <View style={styles.footer}>
                    <Text style={[styles.openLabel, { color: borderColor }]}>Open</Text>
                    <ThemedIcon name="open-in-new" size={18} style={{ color: borderColor }}/>
                </View>
            </View>
        </View>
    )

    return (
        <AnimatedPressable
            onPress={handlePress}
            onLongPress={onLongPress}
            testID={testID}
            style={{ marginVertical: 6 }}
        > 
            {CardContent}
        </AnimatedPressable>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.15)"
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
        alignItems: 'center',
        gap: 5
    },

    openLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
})

export default ThemedProject