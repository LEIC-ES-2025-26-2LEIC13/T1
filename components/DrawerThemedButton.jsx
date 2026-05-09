import {useNavigation} from "expo-router";
import {Pressable} from "react-native";
import {DrawerActions} from "@react-navigation/routers";
import {Colors} from "../constants/Colors";
import ThemedIcon from "./ThemedIcon";
import Animated from "react-native-reanimated";
import AnimatedPressable from "./AnimatedPressable";


const DrawerThemedButton = ({ showNotification }) =>{

    const navigation = useNavigation();
    return (
        <>
            <AnimatedPressable
                testID="drawer-hamburger-button"
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ marginLeft: 20}}
            >
                <ThemedIcon name="menu" size={28} />
            </AnimatedPressable>

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