import {useNavigation} from "expo-router";
import {Pressable, useColorScheme} from "react-native";
import {DrawerActions} from "@react-navigation/routers";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "../constants/Colors";


const DrawerThemedButton = ({ showNotification }) =>{
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const navigation = useNavigation();
    return (
        <>
            <Pressable
                testID="drawer-hamburger-button"
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ marginLeft: 10}}
            >
                <Ionicons name="menu" size={28} color={theme.iconColor} />
            </Pressable>

            {showNotification ? <Ionicons testID="notification-bell" name="notifications" size={15} color={Colors.warning} /> : <></>}
        </>

    );
}

export default DrawerThemedButton