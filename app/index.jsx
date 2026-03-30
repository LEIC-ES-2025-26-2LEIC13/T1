import { StyleSheet } from 'react-native'
import { useUser } from '../hooks/useUser'

// themed components
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'

const Home = () => {

  const { user } = useUser()

  return (
    <ThemedView style={styles.container}>

      <ThemedText title={true} style={styles.title}>Hello, {user}!</ThemedText>
      <ThemedText>Here is your personal data.</ThemedText>

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