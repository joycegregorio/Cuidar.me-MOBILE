import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import RemarcarAgendamentoCard from '@/components/agendamento/remarcarAgendamentoCard';
import {
    atualizarAgendamento,
    atualizarStatusAgendamento,
    listarAgendamentos,
} from '@/database/agendamentoRepository';
import type { AgendamentoComPaciente, StatusAgendamento } from '@/types/agendamento';

const STATUS_LABELS: Record<StatusAgendamento, { fundo: string; texto: string }> = {
  PENDENTE: { fundo: '#FEF3C7', texto: '#92400E' },
  CONFIRMADO: { fundo: '#DCFCE7', texto: '#166534' },
  CANCELADO: { fundo: '#FEE2E2', texto: '#991B1B' },
  REALIZADO: { fundo: '#DBEAFE', texto: '#1E40AF' },
  REMARCADO: { fundo: '#F3E8FF', texto: '#6B21A8' },
};

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export default function ConsultasAgendadasCard() {
  const db = useSQLiteContext();
  const [consultas, setConsultas] = useState<AgendamentoComPaciente[]>([]);
  const [remarcandoConsultaId, setRemarcandoConsultaId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    try {
      setConsultas(await listarAgendamentos(db));
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const handleCancelarConsulta = (id: number) => {
    Alert.alert('Cancelar consulta', 'Tem certeza que deseja cancelar esta consulta?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await atualizarStatusAgendamento(db, id, 'CANCELADO');
            setConsultas((atuais) =>
              atuais.map((c) => (c.id === id ? { ...c, status: 'CANCELADO' } : c))
            );
            Alert.alert('Sucesso', 'Consulta cancelada com sucesso!');
          } catch (error) {
            console.error('Erro ao cancelar a consulta:', error);
            Alert.alert('Erro', 'Não foi possível cancelar a consulta. Tente novamente!');
          }
        },
      },
    ]);
  };

  const handleSalvarRemarcacao = async (
    id: number,
    novosDados: { data: string; horario: string; localidade: string }
  ) => {
    const consulta = consultas.find((c) => c.id === id);
    if (!consulta) return;

    try {
      await atualizarAgendamento(db, id, {
        pacienteId: consulta.pacienteId,
        data: novosDados.data,
        horario: novosDados.horario,
        localidade: novosDados.localidade,
        status: 'REMARCADO',
      });
      await carregar();
      setRemarcandoConsultaId(null);
      Alert.alert('Sucesso', 'Consulta remarcada com sucesso!');
    } catch (error) {
      console.error('Erro ao remarcar a consulta:', error);
      Alert.alert('Erro', 'Não foi possível remarcar a consulta.');
    }
  };

  const renderConsulta = ({ item: consulta }: { item: AgendamentoComPaciente }) => {
    const online = consulta.localidade === 'Online';
    const cor = STATUS_LABELS[consulta.status] ?? STATUS_LABELS.PENDENTE;
    const encerrada = consulta.status === 'CANCELADO' || consulta.status === 'REALIZADO';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.pacienteNome}>
            {consulta.paciente ? consulta.paciente.nome : 'Paciente não encontrado'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: cor.fundo }]}>
            <Text style={[styles.statusTexto, { color: cor.texto }]}>{consulta.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.linha}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.linhaTexto}>{formatarData(consulta.data)}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.linhaTexto}>{consulta.horario}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name={online ? 'videocam-outline' : 'map-outline'} size={16} color="#666" />
            <Text style={styles.linhaTexto}>{consulta.localidade}</Text>
            <View style={styles.tipoBadge}>
              <Text style={styles.tipoBadgeTexto}>{online ? 'Online' : 'Presencial'}</Text>
            </View>
          </View>
        </View>

        {!encerrada && (
          <View style={styles.cardFooter}>
            <Pressable
              style={styles.footerBotao}
              onPress={() => setRemarcandoConsultaId(consulta.id)}
            >
              <Text style={styles.footerBotaoTexto}>Remarcar</Text>
            </Pressable>
            <Pressable
              style={styles.footerBotao}
              onPress={() => handleCancelarConsulta(consulta.id)}
            >
              <Text style={styles.footerBotaoTexto}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const consultaRemarcando = consultas.find((c) => c.id === remarcandoConsultaId) ?? null;

  return (
    <View>
      <FlatList
        data={consultas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderConsulta}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.tituloLinha}>
            <Text style={styles.titulo}>Consultas Agendadas</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma consulta agendada.</Text>}
      />

      <RemarcarAgendamentoCard
        consulta={consultaRemarcando}
        onSalvar={handleSalvarRemarcacao}
        onCancelar={() => setRemarcandoConsultaId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    gap: 16,
  },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { color: '#a755f7', fontSize: 20, fontWeight: 'bold' },
  vazio: { textAlign: 'center', color: '#666', marginTop: 24 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  pacienteNome: { flex: 1, fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusTexto: { fontSize: 12, fontWeight: '600' },

  cardBody: { gap: 8, marginBottom: 16 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linhaTexto: { color: '#333' },
  tipoBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tipoBadgeTexto: { fontSize: 12, color: '#6B21A8' },

  cardFooter: { flexDirection: 'row', gap: 8 },
  footerBotao: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a755f7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerBotaoTexto: { color: '#a755f7', fontSize: 12, fontWeight: '600' },
});