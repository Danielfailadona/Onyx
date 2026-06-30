import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/hooks/useAuth';
import { StoreProvider } from '../src/hooks/useStore';
import { useImmersiveMode } from '../src/hooks/useImmersiveMode';

export default function RootLayout() {
  useImmersiveMode();
  return (
    <AuthProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080808' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="dish-detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="store-detail" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="cart" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="edit-item" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="edit-address" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </StoreProvider>
    </AuthProvider>
  );
}
