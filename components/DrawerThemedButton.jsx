import {useNavigation} from "expo-router";
import {Pressable, TouchableOpacity, useColorScheme} from "react-native";
import {DrawerActions} from "@react-navigation/routers";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "../constants/Colors";


const DrawerThemedButton = () =>{
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const navigation = useNavigation();
    return (
        <Pressable
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 10}}
        >
            <Ionicons name="menu" size={28} color={theme.iconColor} />
        </Pressable>
    );
}

export default DrawerThemedButton