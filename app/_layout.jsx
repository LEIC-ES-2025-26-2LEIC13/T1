import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'
import { UserProvider } from '../contexts/userContext'
import { UsersProvider } from '../contexts/usersContext'
import { ProjectProvider } from '../contexts/projectContext'
import { InviteProvider } from '../contexts/inviteContext'
import { TaskProvider } from '../contexts/taskContext'
import { useUser } from '../hooks/useUser'

import AppToast from '../components/Toast';


// This component was defined explicity, because useUser hook can only be used inside descendents of UserProvider, not inside itself
function RootNavigator() {

  const colorScheme = useColorScheme() // this is either 'dark' or 'light'
  const theme = Colors[colorScheme] ?? Colors.light

  const { user, isLoading } = useUser() // use custom hook to get the value of the state variable user (defined (truthy value) -> logged in; undefined (falsy) -> not logged in)

  return (
      <>
          <Stack screenOptions={{
              headerStyle: { backgroundColor: theme.navBackground },
              headerTintColor: theme.title
          }}>
              
              <Stack.Protected guard={isLoading}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
              </Stack.Protected>

              {/* Unauthenticated: Only show auth stack */}
              <Stack.Protected guard={!isLoading && !user}>
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
    <UserProvider>
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
    </UserProvider>
  )
}

export default RouteLayout
