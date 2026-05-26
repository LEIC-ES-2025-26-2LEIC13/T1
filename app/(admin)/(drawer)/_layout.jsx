import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "react-native";
import { Colors } from "../../../constants/Colors";
import CustomDrawerContent from "../../../components/CustomDrawerContent";
import ThemedIcon from "../../../components/ThemedIcon";
import { commonHeaderOptions } from "../../../constants/navigationStyles";

export default function AdminDrawerLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        ...commonHeaderOptions(theme, false),
        drawerActiveTintColor: theme.iconColorFocused,
        drawerInactiveTintColor: theme.iconColor,
        drawerStyle: { backgroundColor: theme.navBackground },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Home",
          headerShown: false,
          drawerIcon: ({ focused, color }) => (
            <ThemedIcon name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="suggestions"
        options={{
          title: "Suggestions",
          drawerIcon: ({ focused, color }) => (
            <ThemedIcon name={focused ? "lightbulb" : "lightbulb-outline"} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
