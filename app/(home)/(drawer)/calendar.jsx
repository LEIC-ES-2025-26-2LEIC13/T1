// themed components
import SafeAreaPage from '../../../components/SafeAreaPage'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Calendar = () => {
    return(
        <SafeAreaPage style={styles.container}>
            <ThemedText title={true}>Calendar</ThemedText>
        </SafeAreaPage>
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