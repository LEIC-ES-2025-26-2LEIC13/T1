import SafeAreaPage from "../../../components/SafeAreaPage";
import ThemedText from "../../../components/ThemedText";
import { StyleSheet } from "react-native";

export default function Suggestions() {
  return (
    <SafeAreaPage style={styles.container}>
      <ThemedText title>Suggestions</ThemedText>
      <ThemedText>Project suggestions sent by users will appear here.</ThemedText>
    </SafeAreaPage>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
});
