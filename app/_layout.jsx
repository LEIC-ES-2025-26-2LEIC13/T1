import { Stack } from 'expo-router';
import AppToast from '../components/Toast';
import { Colors } from '../constants/Colors';
import { useColorScheme, StyleSheet } from 'react-native';


const RouteLayout = () => {
  return (
    <>
      <Stack stylesheet={styles.container}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="project" options={{ title: 'Project', headerShown: false }} />
      </Stack>
      <AppToast />
    </>
  );
};

export default RouteLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  }
});