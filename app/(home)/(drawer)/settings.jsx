import SafeAreaPage from '../../../components/SafeAreaPage'
import ThemedText from '../../../components/ThemedText'
import {StyleSheet} from "react-native";

const Settings = () => {
    return(
        <SafeAreaPage style={styles.container}>
            <ThemedText title={true}>Settings</ThemedText>
        </SafeAreaPage>
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
