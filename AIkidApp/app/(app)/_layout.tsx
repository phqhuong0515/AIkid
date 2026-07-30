import { Stack } from 'expo-router';

/** Authenticated native shell — every product route runs on Expo. */
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
      <Stack.Screen name="plans" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="capture" />

      {/* Character routes */}
      <Stack.Screen name="character/index" />
      <Stack.Screen name="character/generate-v2" />
      <Stack.Screen name="character/storage-v2" />

      {/* Art routes */}
      <Stack.Screen
        name="art/index"
        options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }}
      />
      <Stack.Screen name="art/style-v2" options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }} />
      <Stack.Screen name="art/canvas" options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }} />

      {/* Comic / Story routes */}
      <Stack.Screen name="comic/create-v2" />
      <Stack.Screen name="comic/genre-v2" />
      <Stack.Screen name="comic/idea-v2" />
      <Stack.Screen name="comic/library-v2" />
      <Stack.Screen name="comic/story-reader" />

      {/* Mee routes */}
      <Stack.Screen
        name="mee/index"
        options={{ contentStyle: { backgroundColor: '#e8f4fa', flex: 1 } }}
      />
    </Stack>
  );
}
