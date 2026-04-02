// themed components
import ThemedView from '../../../components/ThemedView'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Invites = () => {

    return(
        <ThemedView style={styles.container}>
            <ThemedText title={true}>Invites</ThemedText>
        </ThemedView>
    )
}

export default Invites

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});