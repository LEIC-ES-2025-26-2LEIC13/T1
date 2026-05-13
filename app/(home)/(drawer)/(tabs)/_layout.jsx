import {Tabs} from "expo-router"
import {useColorScheme} from "react-native"
import { Colors } from "../../../../constants/Colors"
import { useInvite } from "../../../../hooks/useInvite";
import { commonHeaderOptions } from "../../../../constants/navigationStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedIcon from "../../../../components/ThemedIcon";

export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { hasNewInvites } = useInvite()
    const insets = useSafeAreaInsets() // provides direct access to device safe area dimensions

    return (
        <Tabs
            screenOptions={{
                ...commonHeaderOptions(theme, hasNewInvites),

                tabBarStyle: {
                    backgroundColor: theme.navBackground,
                    paddingTop: 10,
                    paddingBottom: Math.max(insets.bottom, 10),
                    height: 70 + Math.max(insets.bottom, 10)
                },

                tabBarActiveTintColor: theme.iconColorFocused,
                tabBarInactiveTintColor: theme.iconColor,
            }}
        >
            <Tabs.Screen
                name="project_tab"
                options={{
                    title: "My Projects",
                    tabBarIcon: ({ focused }) => (
                        <ThemedIcon
                            size={25}
                            name={ focused ? "folder-open" : "folder" }
                            color={ focused ? theme.iconColorFocused : theme.iconColor }
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused }) => (
                        <ThemedIcon
                            size={25}
                            name={ focused ? 'account' : 'account-outline' }
                            color={ focused ? theme.iconColorFocused : theme.iconColor }
                        />
                    )
                }}
            />
        </Tabs>
    );
}
