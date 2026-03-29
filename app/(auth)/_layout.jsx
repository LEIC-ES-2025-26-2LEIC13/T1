import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function AuthLayout() {
    return (
        <>
          <StatusBar value="auto" />
          <Stack 
            screenOptions={{headerShown: false}} // this only apply to files within this route group
          />
        </>
    )
}
