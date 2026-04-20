import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import {useUser} from "../hooks/useUser";
import {useState} from "react";
import {View} from "react-native";
import {Colors} from "../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

const CustomDrawerContent = (props) =>{
    const [loading, setLoading] = useState(false);
    const { logout } = useUser();

    const HandleLogout = async () => {
        console.log("Logout button pressed"); // 👈 ADD THIS
        setLoading(true);
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error.message);
        } finally {
            setLoading(false);
        }
    }
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
                    label={loading ? "Logging out..." : "Logout"}
                    onPress={HandleLogout}
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
