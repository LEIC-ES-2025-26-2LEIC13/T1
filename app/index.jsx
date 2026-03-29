import { Link } from 'expo-router'
import { StyleSheet } from 'react-native';

export default function index() {
  return (
    <Link href="project" style={styles.container}>
      Go to Project
    </Link>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  }
});