import {
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';

import HeaderAutentication from '@/components/auth/headerAutentication';
import { AuthProvider } from '@/contexts/auth-context';
import { SyncContextProvider } from '@/contexts/sync-context';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/database/migrations';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const cabecalhoPadrao = (title: string) => ({
  title,
  headerTintColor: '#5b00d2',
  headerStyle: { backgroundColor: '#ffffff' },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateDbIfNeeded}
      >
        <AuthProvider>
          <SyncContextProvider>
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="loginPage" options={{ header: () => <HeaderAutentication/> }} />
                <Stack.Screen name="cadastroPage" options={{ header: () => <HeaderAutentication/> }} />
                <Stack.Screen name="sobrePage" options={cabecalhoPadrao('Sobre')} />
                <Stack.Screen name="contatoPage" options={cabecalhoPadrao('Contato')} />

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
          </SyncContextProvider>
        </AuthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
