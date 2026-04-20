import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import {useUser} from "../hooks/useUser";
import {View} from "react-native";
import {Colors} from "../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

const CustomDrawerContent = (props) =>{
    const { logout } = useUser();

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flex: 1 }}
        >
            {/* Top content */}
            <DrawerItemList {...props} />

            {/* Bottom section */}
            <View style={styles.bottomContainer}>
                <DrawerItem
                    label="Logout"
                    onPress={logout}
                    labelStyle={{ color: Colors.warning }}
                    // Drawer passes the size automatically to the icon function
                    icon = {({ size }) => (
                        <Ionicons name="log-out-outline" size={size} color={Colors.warning}/>
                    )}
                />
            </View>
        </DrawerContentScrollView>
    );
}

const styles = {
    bottomContainer: {
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 5,
    }
}

export default CustomDrawerContent;
