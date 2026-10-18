import { listarAgendamentosDoDia } from '@/database/agendamentoRepository';
import { AgendamentoComPaciente } from '@/types/agendamento';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [consultas, setConsultas] = useState<AgendamentoComPaciente[]>([]);
  const [pagina, setPagina] = useState(0);

  useFocusEffect(
    useCallback(() => {
      listarAgendamentosDoDia(db).then((lista) => {
        setConsultas(lista);
        setPagina(0);
      });
    }, [db])
  );

  const totalPaginas = Math.ceil(consultas.length/3);
  const daPagina = consultas.slice(pagina * 3, pagina * 3 + 3);
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
            <Text style={styles.cardSubtitle}>
              Gerencie seus pacientes
            </Text>
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
            {daPagina.map((c) => (
              <Text key={c.id} style={styles.item}>
                {c.paciente.nome} {c.data.split('-').reverse().join('/')} {c.horario}
              </Text>
            ))}

            {totalPaginas > 1 && (
              <View style={styles.paginacao}>
                <Pressable
                  disabled={pagina === 0}
                  onPress={() => setPagina(pagina - 1)}
                  style={{ opacity: pagina === 0 ? 0.3 : 1 }}
                >
                  <Text style={styles.seta}>‹</Text>
                </Pressable>

                <Text style={styles.cardSubtitle}>
                  {pagina + 1} de {totalPaginas}
                </Text>
                <Pressable
                  disabled={pagina >= totalPaginas - 1}
                  onPress={() => setPagina(pagina + 1)}
                  style={{ opacity: pagina >= totalPaginas - 1 ? 0.3 : 1 }}
                >
                  <Text style={styles.seta}>›</Text>
                </Pressable>
              </View> 
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
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  },
  seta: {
    fontSize: 28,
    color: '#5b00d2',
  },
});
