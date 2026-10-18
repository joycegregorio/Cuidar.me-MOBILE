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
            <Stack.Screen name="loginPage" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="cadastroPage" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="sobrePage" options={{ header: () => <HeaderAutentication/> }} />
            <Stack.Screen name="contatoPage" options={{ header: () => <HeaderAutentication/> }} />
            
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