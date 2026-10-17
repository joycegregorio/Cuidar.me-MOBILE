import AgendamentoForm from '@/components/agendamento/agendamentoForm';
import ButtonAgenda, {
  type AbaAgenda,
} from '@/components/agendamento/ButtonAgenda';
import ConsultasAgendadasCard from '@/components/agendamento/consultasAgendadasCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

export default function Agendamentos() {
    const [abaAtiva, setAbaAtiva] = useState<AbaAgenda>('novo');

  return (
    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <ButtonAgenda abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

        {abaAtiva === 'novo' && <AgendamentoForm />}
        {abaAtiva === 'consultas' && <ConsultasAgendadasCard />}
    </LinearGradient>
  );
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});