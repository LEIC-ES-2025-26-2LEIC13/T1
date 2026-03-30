import { Link } from 'expo-router'
import { StyleSheet, useColorScheme } from 'react-native';
import ThemedView from '../components/ThemedView';
import { Colors } from '../constants/Colors';

export default function index() {
  
  const scheme = useColorScheme();
  const palette = Colors[scheme] ?? Colors.light;

  return (
    <ThemedView style={styles.container}>
      <Link href="/project" style={{ color: palette.text, fontSize: 18, textAlign: 'center',
        textAlignVertical: 'center'
       }}>
        Go to Project
      </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});