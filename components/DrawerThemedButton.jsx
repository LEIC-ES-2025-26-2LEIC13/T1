import {useNavigation} from "expo-router";
import {Pressable} from "react-native";
import {DrawerActions} from "@react-navigation/routers";
import {Colors} from "../constants/Colors";
import ThemedIcon from "./ThemedIcon";


const DrawerThemedButton = ({ showNotification }) =>{

    const navigation = useNavigation();
    return (
        <>
            <Pressable
                testID="drawer-hamburger-button"
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ marginLeft: 20}}
            >
                <ThemedIcon name="menu" size={28} />
            </Pressable>

            {showNotification ? 
            <ThemedIcon 
                testID="notification-bell" 
                name="bell" 
                size={15} 
                color={Colors.warning} 
            /> : null}
        </>

    );
}

export default DrawerThemedButton