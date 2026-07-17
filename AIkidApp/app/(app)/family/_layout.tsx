import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFF8F2' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create-child" />
    </Stack>
  );
}
