import { useColorScheme, ActivityIndicator, View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/userContext'
import { ProjectProvider } from '../contexts/projectContext'
import { useUser } from '../hooks/useUser'

import AppToast from '../components/Toast';


// This component was defined explicity, because useUser hook can only be used inside descendents of UserProvider, not inside itself
function RootNavigator() {

  const colorScheme = useColorScheme() // this is either 'dark' or 'light'
  const theme = Colors[colorScheme] ?? Colors.light

  const { user, isLoading } = useUser() // use custom hook to get the value of the state variable user (defined (truthy value) -> logged in; undefined (falsy) -> not logged in)

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.title} style={{ marginBottom: 20 }} />
        <Text style={{ color: theme.title, fontSize: 24, fontWeight: 'bold' }}>Welcome Back</Text>
      </View>
    )
  }

  return (
      <>
          <Stack screenOptions={{
              headerStyle: { backgroundColor: theme.navBackground },
              headerTintColor: theme.title
          }}>
              {/* Unauthenticated: Only show auth stack */}
              <Stack.Protected guard={!user}>
                  <Stack.Screen name='(auth)' options={{ headerShown: false }} />
              </Stack.Protected>

              {/* Authenticated: Show drawer-based stack */}
              <Stack.Protected guard={!!user}>
                  <Stack.Screen name='index' options={{ title: 'Home' }} />
                  <Stack.Screen name='(home)/(drawer)' options={{ headerShown: false }} />
                  <Stack.Screen name='project' options={{ title: 'Project' }} />
              </Stack.Protected>
          </Stack>
          <AppToast />
      </>
  )
}

const RouteLayout = () => {  
  return (
    <UserProvider>
      <StatusBar value="auto" />
      <RootNavigator />
    </UserProvider>
  )
}

export default RouteLayout
