import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '../constants/Colors'
import { AuthProvider } from '../contexts/authContext'
import { ProjectProvider } from '../contexts/projectContext'
import { TemplateProvider } from '../contexts/templateContext'
import { InviteProvider } from '../contexts/inviteContext'
import { useAuth } from '../hooks/useAuth'
import { MenuProvider } from 'react-native-popup-menu';
import AppToast from '../components/Toast';
import { ColumnProvider } from '../contexts/columnContext'
import LoadingScreen from '../components/LoadingScreen'


// This component was defined explicity, because useAuth hook can only be used inside descendents of UserProvider, not inside itself
function RootNavigator() {

  const colorScheme = useColorScheme() // this is either 'dark' or 'light'
  const theme = Colors[colorScheme] ?? Colors.light

  const { user, isLoading, isAdmin } = useAuth() // use custom hook to get the value of the state variable user (defined (truthy value) -> logged in; undefined (falsy) -> not logged in)
  if (isLoading) {
    return (
      <>
        <AppToast />
        <LoadingScreen loadingText="Logging in..." />
      </>
    )
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
        }}
      >
        {/* Unauthenticated: show intro screen and auth stack */}
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Authenticated: Show the appropriate shell based on role */}
        <Stack.Protected guard={!!user}>
          {isAdmin && (
            <Stack.Screen name="(admin)/(drawer)" options={{ headerShown: false }} />
          )}

          {!isAdmin && (
            <Stack.Screen name="(home)/(drawer)" options={{ headerShown: false }} />
          )}

          {!isAdmin && (
            <Stack.Screen name="project" options={{ headerShown: true, title: "" }} />
          )}
        </Stack.Protected>
      </Stack>
      <AppToast />
    </>
  )
}

const RouteLayout = () => {  
  return (
    <MenuProvider>
      <AuthProvider>
        <ProjectProvider>
          <TemplateProvider>
            <ColumnProvider>
                <InviteProvider>
                  <StatusBar value="auto" />
                  <RootNavigator />
              </InviteProvider>
            </ColumnProvider>
          </TemplateProvider>
        </ProjectProvider>
      </AuthProvider>
    </MenuProvider>
  )
}

export default RouteLayout
