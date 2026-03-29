import { Stack } from 'expo-router';
import AppToast from '../components/Toast';


const RouteLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="project" options={{ title: 'Project', headerShown: false }} />
      </Stack>
      <AppToast />
    </>
  );
};

export default RouteLayout;
