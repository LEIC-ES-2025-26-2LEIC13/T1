import { Drawer } from "expo-router/drawer";
import {useColorScheme} from "react-native";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import DrawerThemedButton from "../../../components/DrawerThemedButton";
import { ProjectProvider } from "../../../contexts/projectContext";
import CustomDrawerContent from "../../../components/CustomDrawerContent";
import { useInvite } from "../../../hooks/useInvite";

export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { hasNewInvites } = useInvite()
    
    return (
        <ProjectProvider>
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: theme.navBackground },
                headerTintColor: theme.title,
                headerTitleAlign: "left",

                    headerTitleStyle: {
                        color: theme.title,
                        fontWeight: "700",
                        fontSize: 30,
                        lineHeight: 34,
                        marginLeft: 10,
                    },

                    drawerActiveTintColor: theme.iconColorFocused,
                    drawerInactiveTintColor: theme.iconColor,

                    drawerStyle: {
                        backgroundColor: theme.navBackground,
                    },

                    headerLeft: () => <DrawerThemedButton showNotification={hasNewInvites}/>
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        title: "Home",
                        headerShown: false,
                        drawerIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "home" : "home-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="tasks"
                    options={{
                        title: "My Tasks",
                        drawerIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="calendar" 
                    options={{
                        title: "Calendar",
                        drawerIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "calendar" : "calendar-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="invites"
                    options={{
                        title: "Invites",
                        drawerIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "mail" : (hasNewInvites ? "mail-unread-outline" : "mail-outline")}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        drawerIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? "settings" : "settings-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
            </Drawer>
        </ProjectProvider>
    );
}
