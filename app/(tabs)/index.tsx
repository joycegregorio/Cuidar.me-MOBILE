import { useAuth } from '@/contexts/auth-context';
import { listarAgendamentosDoDia } from '@/database/agendamentoRepository';
import { anotacaoRepository } from '@/database/anotacaoRepository';
import { AgendamentoComPaciente } from '@/types/agendamento';
import { formatarDiaMes, hojeISO, somarDias } from '@/utils/data';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const MAX_VISIVEIS = 3;


export default function HomeScreen() {
  const db = useSQLiteContext();
  const [consultas, setConsultas] = useState<AgendamentoComPaciente[]>([]);

  const { psicologo } = useAuth();
  const [dataAnotacao, setDataAnotacao] = useState(hojeISO());
  const [texto, setTexto] = useState('');
  const [situacao, setSituacao] = useState<'carregando' | 'salvando' | 'salvo'>('carregando');

  useFocusEffect(
    useCallback(() => {
      listarAgendamentosDoDia(db).then(setConsultas);
    }, [db])
  );

  useEffect(() => {
    if (!psicologo) return;
    let ativo = true;

    anotacaoRepository.buscar(db, String(psicologo.id), dataAnotacao).then((salvo) => {
      if(!ativo) return;
      setTexto(salvo);
      setSituacao('salvo');
    });

    return () => {
      ativo = false;
    };
  }, [db, psicologo, dataAnotacao]);

  useEffect(() => {
    if (situacao !== 'salvando' || !psicologo) return;

    const timer = setTimeout(() => {
      anotacaoRepository
      .salvar(db, String(psicologo.id), dataAnotacao, texto)
      .then(() => setSituacao('salvo'));
    }, 800);

    return () => clearTimeout(timer);

  }, [db, psicologo, dataAnotacao, texto, situacao]);

  const mudarDia = async (dias: number) => {
    if (situacao === 'salvando' && psicologo) {
      await anotacaoRepository.salvar(db, String(psicologo.id), dataAnotacao, texto);
    }
    setSituacao('carregando');
    setDataAnotacao(somarDias(dataAnotacao, dias));
  }

  const ehHoje = dataAnotacao === hojeISO();

  const consultasVisiveis = consultas.slice(0, MAX_VISIVEIS);
  const temMaisConsultas = consultas.length > MAX_VISIVEIS;

  return (

    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <ScrollView style={styles.conteudo} keyboardShouldPersistTaps="handled">
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
  
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Anotações
            </Text>

            <View style={styles.linhaData}>
              <Pressable onPress={() => mudarDia(-1)} hitSlop={12}>
                <Text style={styles.seta}>‹</Text>
              </Pressable>

              <Text style={styles.textoData}>
                {ehHoje ? 'Hoje' : formatarDiaMes(dataAnotacao)}
              </Text>

              <Pressable onPress={() => mudarDia(1)}  disabled={ehHoje} hitSlop={12}>
                <Text style={[styles.seta, ehHoje && styles.setaDesabilitada]}>›</Text>
              </Pressable>
            </View>
          

            <TextInput
              style={styles.campoAnotacao}
              multiline
              maxLength={1000}
              placeholder="Digite suas anotações do dia aqui..."
              placeholderTextColor="#9b8bc4"
              value={texto}
              editable={situacao !== 'carregando'}
              onChangeText={(t) => {
                setTexto(t);
                setSituacao('salvando');
              }}
            />

            <Text style={styles.situacaoSalvamento}>
              {situacao === 'salvando' ? 'Salvando...' : situacao === 'salvo' ? ' ' : ''}
            </Text>
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
  verMais: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5b00d2',
    marginTop: 4,
  },
  linhaData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seta: {
    fontSize: 28,
    color: '#5b00d2',
    paddingHorizontal: 8,
  },
  setaDesabilitada: {
    opacity: 0.3,
  },
  textoData: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5b00d2',
  },
  campoAnotacao: {
    minHeight: 110,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#d9c8ff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#5b00d2',
    backgroundColor: '#ffffff',
  },
  situacaoSalvamento: {
    fontSize: 13,
    color: '#7a5bc4',
    textAlign: 'right',
    marginTop: 6,
    minHeight: 16,
  },
});