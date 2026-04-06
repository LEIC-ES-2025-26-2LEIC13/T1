import {View, Text, StyleSheet, useColorScheme} from "react-native";
import {Colors} from "../../../../constants/Colors";

const Profile = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <Text style={[styles.text, {color: theme.text}]}>Profile page</Text>
        </View>
    )
}

export default Profile;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text:{
        fontSize: 18,
        fontWeight: "bold",
    }
})