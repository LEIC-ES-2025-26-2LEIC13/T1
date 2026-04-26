import { useColorScheme, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'
import { AuthProvider } from '../contexts/AuthContext'
import { ProjectProvider } from '../contexts/projectContext'
import { InviteProvider } from '../contexts/inviteContext'
import { TaskProvider } from '../contexts/taskContext'
import { UsersProvider } from '../contexts/usersContext'
import { useAuth } from '../hooks/useAuth'
import AppToast from '../components/Toast';
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'


// This component was defined explicity, because useAuth hook can only be used inside descendents of UserProvider, not inside itself
function RootNavigator() {

  const colorScheme = useColorScheme() // this is either 'dark' or 'light'
  const theme = Colors[colorScheme] ?? Colors.light

  const { user, isLoading } = useAuth() // use custom hook to get the value of the state variable user (defined (truthy value) -> logged in; undefined (falsy) -> not logged in)

  if (isLoading) {
	return (
		<ThemedView style={styles.container}>
            <ActivityIndicator size="large" color="#000" />
            <ThemedText style={styles.text}>
                Loading...
            </ThemedText>
        </ThemedView>
	)
  }
  return (
      <>
          <Stack 
            screenOptions={{
                headerStyle: { backgroundColor: theme.navBackground },
                headerTintColor: theme.title
          }}>
              {/* Unauthenticated: show intro screen and auth stack */}
              <Stack.Protected guard={!isLoading && !user}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name='(auth)' options={{ headerShown: false }} /> 
              </Stack.Protected>

              {/* Authenticated: Show drawer-based stack (maybe pass project header logic to here, to avoid overides inside project, which causes inconsistency in its header.*/}
              <Stack.Protected guard={!isLoading && !!user}>
                  <Stack.Screen name='(home)/(drawer)' options={{ headerShown: false }} />
                  <Stack.Screen name='project' options={{ headerShown: true, title:''}} /> 
              </Stack.Protected>
          </Stack>
          <AppToast />
      </>
  )
}

const RouteLayout = () => {  
  return (
    <AuthProvider>
      <UsersProvider>
        <ProjectProvider>
          <InviteProvider>
            <TaskProvider>
              <StatusBar value="auto" />
              <RootNavigator />
            </TaskProvider>
          </InviteProvider>
        </ProjectProvider>
      </UsersProvider>
    </AuthProvider>
  )
}

export default RouteLayout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        marginTop: 15,
        fontSize: 16,
        color: "#555",
    },
})