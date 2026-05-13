import DrawerThemedButton from "../components/DrawerThemedButton";

// This function returns the shared header options between tabs and drawer screen
export function commonHeaderOptions(theme, hasNewInvites) {
    return {
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        headerTitleAlign: "left",
        headerTitleStyle: {
            color: theme.title,
            fontWeight: "700",
            fontSize: 25,
            marginLeft: 15,
        },
        headerLeft: () => <DrawerThemedButton showNotification={hasNewInvites} />,
    };
}