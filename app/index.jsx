import { StyleSheet, Text } from 'react-native'
import { Link } from 'expo-router' 

// themed components
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import Spacer from '../components/Spacer'
import Login from './(auth)/login'

const Home = () => {
  return (
    <ThemedView style={styles.container}>

      <ThemedText title={true} style={styles.title}>Home</ThemedText>

      <Link href="/login" style={styles.link}>
        <ThemedText>Login</ThemedText>
      </Link>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18
  },

  link: {
    marginVertical: 10,
    borderBottomWidth: 1
  }
})