import {Tabs} from "expo-router"
import {useColorScheme} from "react-native"
import { Colors } from "../../../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import { useInvite } from "../../../../hooks/useInvite";
import { commonHeaderOptions } from "../../../../constants/navigationStyles";

export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const { hasNewInvites } = useInvite()

    return (
        <Tabs
            screenOptions={{
                ...commonHeaderOptions(theme, hasNewInvites),

                tabBarStyle: {
                    backgroundColor: theme.navBackground,
                    paddingTop: 10,
                    height: 90
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
                        <Ionicons
                            size={ 24 }
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
                        <Ionicons
                            size={ 24 }
                            name={ focused ? 'person' : 'person-outline' }
                            color={ focused ? theme.iconColorFocused : theme.iconColor }
                        />
                    )
                }}
            />
        </Tabs>
    );
}
