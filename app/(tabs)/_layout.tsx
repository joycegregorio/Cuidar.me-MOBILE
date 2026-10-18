import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, ColorValue, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import Header from '../../components/ui/header';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const aba = (
  title: string,
  icon: IconName,
  iconFocado: IconName
) => ({
  title,
  tabBarIcon: ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? iconFocado : icon}
      size={size}
      color={color}
    />
  ),
});

export default function TabsLayout() {
  const { psicologo, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#5b00d2" />
      </View>
    );
  }

  if (!psicologo) return <Redirect href="/loginPage" />;

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarActiveTintColor: '#5b00d2',
        tabBarInactiveTintColor: '#9a8bb5',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={aba('Início', 'home-outline', 'home')}
      />

      <Tabs.Screen
        name="paciente/pacientePage"
        options={aba('Pacientes', 'people-outline', 'people')}
      />

      <Tabs.Screen
        name="agendamento/agendamentoPage"
        options={aba('Agenda', 'calendar-outline', 'calendar')}
      />
    </Tabs>
  );
}
