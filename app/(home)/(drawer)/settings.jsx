import ThemedView from '../../../components/ThemedView'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Settings = () => {
    return(
        <ThemedView style={styles.container}>
            <ThemedText title={true}>Settings</ThemedText>
        </ThemedView>
    )
}

export default Settings

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
