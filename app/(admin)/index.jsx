import SafeAreaPage from "../../components/SafeAreaPage";
import ThemedText from "../../components/ThemedText";
import { StyleSheet } from "react-native";

export default function AdminIndex() {
  return (
    <SafeAreaPage style={styles.container}>
      <ThemedText title>Admin Home</ThemedText>
      <ThemedText>Welcome to the admin area.</ThemedText>
    </SafeAreaPage>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
});
