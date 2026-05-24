import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../../../constants/Colors";
import { commonHeaderOptions } from "../../../../constants/navigationStyles";
import ThemedIcon from "../../../../components/ThemedIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminTabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        ...commonHeaderOptions(theme, false),
        tabBarStyle: {
          backgroundColor: theme.navBackground,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
          height: 70 + Math.max(insets.bottom, 10),
        },
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor,
      }}
    >
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ focused }) => (
            <ThemedIcon size={25} name={focused ? "shield-account" : "shield-account-outline"} color={focused ? theme.iconColorFocused : theme.iconColor} />
          ),
        }}
      />
    </Tabs>
  );
}
