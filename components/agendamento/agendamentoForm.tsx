import { inserirAgendamento } from '@/database/agendamentoRepository';
import { pacienteRepository } from '@/database/pacienteRepository';
import type { Paciente } from '@/types/paciente';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onSalvo?: () => void;
};

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const LOCALIDADES = [
  'CRAS - Campina Grande',
  'CRAS - Nova Cruz',
  'Cuidar e Ser - Campina Grande',
];

const formatarDataBR = (d: Date) => d.toLocaleDateString('pt-BR');

const formatarDataISO = (d: Date) => {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export default function AgendamentoForm({ onSalvo }: Props) {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets(); 
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  const [data, setData] = useState<Date | null>(null);
  const [mostrarData, setMostrarData] = useState(false);
  const [horario, setHorario] = useState('');
  const [tipo, setTipo] = useState('');
  const [localidade, setLocalidade] = useState('');

  const alturaHeader = insets.top + 56;

  useFocusEffect(
    useCallback(() => {
      pacienteRepository
        .listar(db)
        .then(setPacientes)
        .catch((error) => console.error('Erro ao buscar pacientes:', error));
    }, [db])
  );

  const sugestoes = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const selecionarPaciente = (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setBusca(paciente.nome);
    setMostrarSugestoes(false);
    Keyboard.dismiss(); 
  };

  const handleSubmit = async () => {
    if (!pacienteSelecionado) return Alert.alert('Atenção', 'Selecione um paciente.');
    if (!data) return Alert.alert('Atenção', 'Selecione a data.');
    if (!horario) return Alert.alert('Atenção', 'Selecione o horário.');
    if (!tipo) return Alert.alert('Atenção', 'Selecione o tipo de atendimento.');
    if (tipo === 'presencial' && !localidade)
      return Alert.alert('Atenção', 'Selecione a localidade.');

    setSalvando(true);
    try {
      await inserirAgendamento(db, {
        pacienteId: pacienteSelecionado.id,
        data: formatarDataISO(data),
        horario,
        localidade: tipo === 'presencial' ? localidade : 'Online',
        status: 'PENDENTE',
      });

      Alert.alert(
        'Consulta agendada',
        `${pacienteSelecionado.nome}\n${formatarDataBR(data)} às ${horario}`
      );

      setBusca('');
      setMostrarSugestoes(false);
      setPacienteSelecionado(null);
      setData(null);
      setHorario('');
      setTipo('');
      setLocalidade('');
      onSalvo?.();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível agendar a consulta. Tente novamente!');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={alturaHeader}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Agendamento de Consulta</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paciente</Text>

          <View style={styles.inputBusca}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.inputBuscaText}
              placeholder="Buscar paciente"
              value={busca}
              onChangeText={(texto) => {
                setBusca(texto);
                setPacienteSelecionado(null);
                setMostrarSugestoes(true);
              }}
            />
          </View>

          {mostrarSugestoes && busca.length > 0 && (
            <View style={styles.resultadoBusca}>
              {sugestoes.map((paciente) => (
                <Pressable
                  key={paciente.id}
                  style={styles.sugestaoItem}
                  onPress={() => selecionarPaciente(paciente)}
                >
                  <Text>{paciente.nome}</Text>
                </Pressable>
              ))}
              {sugestoes.length === 0 && (
                <Text style={styles.sugestaoItem}>Nenhum paciente encontrado.</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Consulta</Text>

          <Text style={styles.label}>Data</Text>
          <Pressable style={styles.inputBusca} onPress={() => setMostrarData(true)}>
            <Ionicons name="calendar" size={18} color="#666" />
            <Text style={styles.dataTexto}>
              {data ? formatarDataBR(data) : 'Selecione a data'}
            </Text>
          </Pressable>

          {mostrarData && (
            <DateTimePicker
              value={data || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, dataEscolhida) => {
                setMostrarData(false);
                if (event.type === 'set' && dataEscolhida) setData(dataEscolhida);
              }}
            />
          )}

          <Text style={styles.label}>Horário</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={horario} onValueChange={setHorario}>
              <Picker.Item label="Selecione o horário" value="" />
              {HORARIOS.map((h) => (
                <Picker.Item key={h} label={h} value={h} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tipo de Atendimento</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={tipo} onValueChange={setTipo}>
              <Picker.Item label="Selecione o tipo" value="" />
              <Picker.Item label="Online" value="online" />
              <Picker.Item label="Presencial" value="presencial" />
            </Picker>
          </View>

          {tipo === 'presencial' && (
            <>
              <Text style={styles.label}>Localidade</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={localidade} onValueChange={setLocalidade}>
                  <Picker.Item label="Selecione o local" value="" />
                  {LOCALIDADES.map((l) => (
                    <Picker.Item key={l} label={l} value={l} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        <Pressable
          style={[styles.botao, salvando && styles.botaoDesabilitado]}
          onPress={handleSubmit}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Agendar Consulta</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1, 
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#a755f7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
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
  inputBuscaText: {
    flex: 1,
  },
  dataTexto: {
    flex: 1,
  },
  resultadoBusca: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  sugestaoItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTexto: {
    flex: 1,
  },
  botao: {
    backgroundColor: '#a755f7',
    padding: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 4,
  },
});