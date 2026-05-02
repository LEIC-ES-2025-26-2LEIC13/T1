import { Drawer } from "expo-router/drawer";
import {useColorScheme} from "react-native";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import DrawerThemedButton from "../../../components/DrawerThemedButton";
import CustomDrawerContent from "../../../components/CustomDrawerContent";
import { useInvite } from "../../../hooks/useInvite";

export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { hasNewInvites } = useInvite()
    
    return (
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

                    drawerActiveTintColor: theme.iconColorFocused, // color for the icon and label of the currently active drawer item
                    drawerInactiveTintColor: theme.iconColor, // color for the icon and label of all inactive drawer items

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
                            testID="home-drawer-screen"
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
                            testID="tasks-drawer-screen"
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
                            testID="calendar-drawer-screen"
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
                            testID={hasNewInvites ? "invites-with-notification" : "invites-drawer-screen"}
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
                            testID="settings-drawer-screen"
                            name={focused ? "settings" : "settings-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Drawer>
    );
}
