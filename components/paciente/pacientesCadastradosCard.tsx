import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { pacienteRepository } from '@/database/pacienteRepository';
import type { Paciente } from '@/types/paciente';
import { calcularIdade } from '@/utils/validacaoPaciente';

type Props = {
  onEditar: (paciente: Paciente) => void;
};

export default function PacientesCadastradosCard({ onEditar }: Props) {
  const db = useSQLiteContext();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setPacientes(await pacienteRepository.listar(db, busca));
      setErro(false);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, [db, busca]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const handleExcluir = (paciente: Paciente) => {
    Alert.alert(
      'Excluir paciente',
      `Tem certeza que deseja excluir ${paciente.nome}? Os agendamentos deste paciente também serão excluídos. Essa ação não pode ser desfeita.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await pacienteRepository.remover(db, paciente.id);
              setPacientes((atuais) => atuais.filter((p) => p.id !== paciente.id));
              Alert.alert('Sucesso', 'Paciente excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir paciente:', error);
              Alert.alert('Erro', 'Não foi possível excluir o paciente. Tente novamente!');
            }
          },
        },
      ]
    );
  };

  const renderPaciente = ({ item: paciente }: { item: Paciente }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pacienteNome}>{paciente.nome}</Text>
        <View style={styles.idadeBadge}>
          <Text style={styles.idadeTexto}>{calcularIdade(paciente.dataNascimento)} anos</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.linha}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.linhaTexto}>{paciente.cpf}</Text>
        </View>
        <View style={styles.linha}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.linhaTexto}>{paciente.telefone}</Text>
        </View>
        <View style={styles.linha}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.linhaTexto}>
            {paciente.enderecoPessoal.cidade} - {paciente.enderecoPessoal.estado}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Pressable style={styles.footerBotao} onPress={() => onEditar(paciente)}>
          <Text style={styles.footerBotaoTexto}>Editar</Text>
        </Pressable>
        <Pressable style={styles.footerBotao} onPress={() => handleExcluir(paciente)}>
          <Text style={styles.footerBotaoTexto}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );

  if (carregando) {
    return <ActivityIndicator style={styles.carregando} size="large" color="#FFFFFF" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPaciente}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Pacientes Cadastrados</Text>
            <View style={styles.inputBusca}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.inputBuscaText}
                placeholder="Buscar por nome ou CPF"
                value={busca}
                onChangeText={setBusca}
              />
            </View>
            {pacientes.length > 0 && (
              <Text style={styles.contador}>
                {pacientes.length} {pacientes.length === 1 ? 'paciente' : 'pacientes'}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={erro ? styles.erro : styles.vazio}>
            {erro
              ? 'Não foi possível carregar os pacientes.'
              : busca.trim()
                ? 'Nenhum paciente encontrado para essa busca.'
                : 'Nenhum paciente cadastrado.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  carregando: {
    marginTop: 32,
  },
  lista: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  cabecalho: { gap: 12 },
  titulo: { color: '#a755f7', fontSize: 20, fontWeight: 'bold' },
  inputBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    gap: 8,
  },
  inputBuscaText: { flex: 1 },
  contador: { color: '#666' },
  vazio: { textAlign: 'center', color: '#666', marginTop: 24 },
  erro: { textAlign: 'center', color: '#dc2626', marginTop: 24 },

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
  idadeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idadeTexto: { fontSize: 12, fontWeight: '600', color: '#6B21A8' },

  cardBody: { gap: 8, marginBottom: 16 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linhaTexto: { color: '#333' },

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
