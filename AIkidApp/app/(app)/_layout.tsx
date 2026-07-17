import { Stack } from 'expo-router';

/** Authenticated shell — Option C: parent_only + creative offline routes */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFF7ED', flex: 1 },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="lobby" />
      <Stack.Screen name="account" />
      <Stack.Screen name="family" />
      <Stack.Screen name="character/index" />
      <Stack.Screen name="character/feature" />
      <Stack.Screen name="character/generate" />
      <Stack.Screen name="character/storage" />
      {/* Full-viewport iframe for original Mee HTML — no padding */}
      <Stack.Screen
        name="mee/index"
        options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }}
      />
      <Stack.Screen
        name="art/index"
        options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }}
      />
      <Stack.Screen
        name="comic/index"
        options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }}
      />
    </Stack>
  );
}
