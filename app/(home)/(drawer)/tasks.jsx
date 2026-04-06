// themed components
import ThemedView from '../../../components/ThemedView'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Tasks = () => {

    return(
        <ThemedView style={styles.container}>
            <ThemedText title={true}>Tasks</ThemedText>
        </ThemedView>
    )
}

export default Tasks;

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});