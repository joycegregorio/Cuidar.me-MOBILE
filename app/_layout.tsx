import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';

import HeaderAutentication from '@/components/auth/headerAutentication';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/database/migrations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateDbIfNeeded}
      >
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="login" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="cadastro" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="sobre" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="contato" options={{ header: () => <HeaderAutentication/> }} />
            
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>

          <StatusBar style="dark" />
        </ThemeProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}