import AgendamentoForm from '@/components/agendamento/agendamentoForm';
import AbasSegmentadas, {type Aba} from '@/components/ui/abasSegmentadas';
import ConsultasAgendadasCard from '@/components/agendamento/consultasAgendadasCard';
import FundoGradiente from '@/components/ui/fundoGradiente';
import {  } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

type AbaAgenda = 'novo' | 'consultas';

export default function Agendamentos() {
    const [abaAtiva, setAbaAtiva] = useState<AbaAgenda>('novo');

    const ABAS: Aba<AbaAgenda>[] = [
      { valor: 'novo', rotulo: 'Novo Agendamento', icone: 'calendar-outline'},
      { valor: 'consultas', rotulo: 'Consultas Agendadas', icone: 'clipboard-outline'},
    ];
  return (
    <FundoGradiente style={styles.container}
    >
        <AbasSegmentadas abas={ABAS} abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

        {abaAtiva === 'novo' && <AgendamentoForm onSalvo={() => setAbaAtiva('consultas')} />}
        {abaAtiva === 'consultas' && <ConsultasAgendadasCard />}
    </FundoGradiente>
  );
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});