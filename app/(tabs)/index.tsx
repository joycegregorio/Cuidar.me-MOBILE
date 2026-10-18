import { listarAgendamentosDoDia } from '@/database/agendamentoRepository';
import { pacienteRepository } from '@/database/pacienteRepository';
import { AgendamentoComPaciente } from '@/types/agendamento';
import { Paciente } from '@/types/paciente';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
const MAX_VISIVEIS = 3;

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [consultas, setConsultas] = useState<AgendamentoComPaciente[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  useFocusEffect(
    useCallback(() => {
      listarAgendamentosDoDia(db).then(setConsultas);
      pacienteRepository.listar(db).then(setPacientes);
    }, [db])
  );

  const consultasVisiveis = consultas.slice(0, MAX_VISIVEIS);
  const temMaisConsultas = consultas.length > MAX_VISIVEIS;

  const pacientesVisiveis = pacientes.slice(0, MAX_VISIVEIS);
  const temMaisPacientes = pacientes.length > MAX_VISIVEIS;

  return (

    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <ScrollView style={styles.conteudo}>
          <View style={styles.boasVindas}>
            <Text style={styles.titulo}>
              Bem-vindo(a)!
            </Text>
            <Text style={styles.subtitulo}>
              Veja suas informações.
            </Text>
          </View>

        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Pacientes
            </Text>
            {pacientes.length === 0 && (
              <Text style={styles.cardSubtitle}>
                Gerencie seus pacientes
              </Text>
            )}

            {pacientesVisiveis.map((p) => (
              <View key={p.id} style={styles.itemLinha}>
                <Text style={styles.itemNome}>{p.nome}</Text>
                <Text style={styles.itemTelefone}>{p.telefone}</Text>
              </View>
            ))}

            {temMaisPacientes && (
              <Pressable onPress={() => router.push('/(tabs)/paciente/pacientePage')}>
                <Text style={styles.verMais}>Ver mais...</Text>
              </Pressable>
            )}
          </View>
  
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Consultas do dia
            </Text>
            {consultas.length === 0 && (
              <Text style={styles.cardSubtitle}>
                  Nenhuma consulta para hoje.
              </Text>
            )}

            {consultasVisiveis.map((c) => (
              <View key={c.id} style={styles.itemLinha}>
                <Text style={styles.itemHorario}>{c.horario}</Text>
                <Text style={styles.itemNome} numberOfLines={1}>{c.paciente.nome}</Text>
              </View>
            ))}

            {temMaisConsultas && (
              <Pressable onPress={() => router.push('/(tabs)/agendamento/agendamentoPage')} hitSlop={8}>
                <Text style={styles.verMais}>Ver mais...</Text>
              </Pressable>
            )}
          </View>
        </View>

      </ScrollView>
    </LinearGradient>  

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
  },
  boasVindas: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4eefa',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 17,
    color: '#f4eefa',
    textAlign: 'center',
  }, 
  cards: {
    gap: 20,
  },
  card: { 
    backgroundColor: '#f4eefa',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#5b00d2',
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 17,
    color: '#5b00d2',
    textAlign: 'center',
  },
  item: {
    fontSize: 16,
    color: '#5b00d2',
    marginBottom: 8,
  },
  seta: {
    fontSize: 28,
    color: '#5b00d2',
  },
  itemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  itemHorario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b00d2',
    minWidth: 48,
  },
  itemNome: {
    flex: 1,
    fontSize: 16,
    color: '#5b00d2',
  },
  itemTelefone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b00d2',
    minWidth: 48,
  },
  verMais: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b00d2',
    marginTop: 4,
  },
});
