import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/userContext'
import { useUser } from '../hooks/useUser'


// This component was defined explicity, because useUser hook can only be used inside descendents of UserProvider, not inside itself
function RootNavigator() {

  const colorScheme = useColorScheme() // this is either 'dark' or 'light'
  const theme = Colors[colorScheme] ?? Colors.light

  const { user } = useUser() // use custom hook to get the value of the state variable user (defined (truthy value) -> logged in; undefined (falsy) -> not logged in)
 
  return (
      <Stack screenOptions={{
          headerStyle: {backgroundColor: theme.navBackground},
          headerTintColor: theme.title
      }}>
        
        <Stack.Protected guard={!user}>
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        </Stack.Protected>
        
        <Stack.Protected guard={!!user}>
          <Stack.Screen name='index' options={{ title: 'Home' }} />
        </Stack.Protected>
        
      </Stack>
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