import  { View, Text } from "react-native";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";

const App = () =>{
    return(
        <View style={styles.container}>
            <Text>Hi</Text>
            <Link href="/projects">
                click me
            </Link>
        </View>
    )
}

export default App;

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});