import { Tabs } from "expo-router"
import { View, Text, useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"

export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: theme.navBackground },
                headerTintColor: theme.title,
                headerTitleAlign: "left",

                // Change the header tittle of the screen
                headerTitleStyle: {
                    color: theme.title,
                    fontWeight: "700",
                    fontSize: 30,
                    lineHeight: 34,
                    marginLeft: 10,
                },

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
                name="projects"
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
