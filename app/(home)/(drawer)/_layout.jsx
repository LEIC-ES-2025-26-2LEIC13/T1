import { Drawer } from "expo-router/drawer";
import {useColorScheme} from "react-native";
import { Colors } from "../../../constants/Colors";
import CustomDrawerContent from "../../../components/CustomDrawerContent";
import { useInvite } from "../../../hooks/useInvite";
import ThemedIcon from "../../../components/ThemedIcon";
import { commonHeaderOptions } from "../../../constants/navigationStyles";

export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { hasNewInvites } = useInvite()
    
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                ...commonHeaderOptions(theme, hasNewInvites),
                
                drawerActiveTintColor: theme.iconColorFocused, // color for the icon and label of the currently active drawer item
                drawerInactiveTintColor: theme.iconColor, // color for the icon and label of all inactive drawer items

                drawerStyle: {
                    backgroundColor: theme.navBackground,
                }
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    title: "Home",
                    headerShown: false,
                    drawerIcon: ({ focused, color }) => (
                        <ThemedIcon
                            testID="home-drawer-screen"
                            name={focused ? "home" : "home-outline"}
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
                        <ThemedIcon
                            testID="tasks-drawer-screen"
                            name={focused ? "check-circle" : "check-circle-outline"}
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
                        <ThemedIcon
                            testID={hasNewInvites ? "invites-with-notification" : "invites-drawer-screen"}
                            name={focused ? "email" : (hasNewInvites ? "email-alert-outline" : "email-outline")}
                            color={hasNewInvites ? Colors.primary : color}
                        />
                    ),
                }}
            />
        </Drawer>
    );
}
