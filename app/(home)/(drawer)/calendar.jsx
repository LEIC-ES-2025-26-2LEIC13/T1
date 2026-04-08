// themed components
import ThemedView from '../../../components/ThemedView'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Calendar = () => {
    return(
        <ThemedView style={styles.container}>
            <ThemedText title={true}>Calendar</ThemedText>
        </ThemedView>
    )
}

export default Calendar

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});