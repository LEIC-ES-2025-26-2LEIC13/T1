import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { useUser } from "../hooks/useUser";
// themed components
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'

const App = () =>{

  const { user } = useUser()

  return(
      <ThemedView style={styles.container}>
          <ThemedText title={true} style={styles.title}>Hello, {user}!</ThemedText>
          <Link style={styles.link} href="/projects">
              Click me
          </Link>
      </ThemedView>
  )
}

export default App;

const styles =  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
      fontWeight: 'bold',
      fontSize: 18
    },

    link: {
      marginVertical: 10,
      borderBottomWidth: 1
    }
});