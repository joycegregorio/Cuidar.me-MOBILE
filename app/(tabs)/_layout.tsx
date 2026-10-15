import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    color: string;
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
