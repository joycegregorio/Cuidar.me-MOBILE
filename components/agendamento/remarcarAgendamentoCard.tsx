import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AgendamentoComPaciente } from '@/types/agendamento';

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const LOCALIDADES = [
  'CRAS - Campina Grande',
  'CRAS - Nova Cruz',
  'Cuidar e Ser - Campina Grande',
];

type Tipo = 'online' | 'presencial';

type Props = {
  consulta: AgendamentoComPaciente | null;
  onSalvar: (id: number, novosDados: { data: string; horario: string; localidade: string }) => void;
  onCancelar: () => void;
};

const pad = (n: number) => String(n).padStart(2, '0');
const formatarDataISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function RemarcarAgendamentoCard({ consulta, onSalvar, onCancelar }: Props) {
  const [data, setData] = useState<Date>(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [horario, setHorario] = useState('');
  const [tipo, setTipo] = useState<Tipo>('presencial');
  const [localidade, setLocalidade] = useState('');

  useEffect(() => {
    if (!consulta) return;

    const [ano, mes, dia] = consulta.data.split('-').map(Number);
    const online = consulta.localidade === 'Online';

    setData(new Date(ano, mes - 1, dia));
    setHorario(consulta.horario);
    setTipo(online ? 'online' : 'presencial');
    setLocalidade(online ? '' : consulta.localidade);
    setMostrarData(false);
  }, [consulta]);

  const handleSalvar = () => {
    if (!consulta) return;

    if (!horario) return Alert.alert('Atenção', 'Selecione o horário.');
    if (tipo === 'presencial' && !localidade) {
      return Alert.alert(
        'Atenção',
        'Por favor, selecione a localidade para o atendimento presencial.'
      );
    }

    onSalvar(consulta.id, {
      data: formatarDataISO(data),
      horario,
      localidade: tipo === 'presencial' ? localidade : 'Online',
    });
  };

  return (
    <Modal visible={consulta !== null} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>Remarcar consulta</Text>
          {consulta?.paciente && <Text style={styles.paciente}>{consulta.paciente.nome}</Text>}

          <Text style={styles.label}>Data</Text>
          <Pressable style={styles.campo} onPress={() => setMostrarData(true)}>
            <Text>{data.toLocaleDateString('pt-BR')}</Text>
          </Pressable>
          {mostrarData && (
            <DateTimePicker
              value={data}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, escolhida) => {
                setMostrarData(false);
                if (event.type === 'set' && escolhida) setData(escolhida);
              }}
            />
          )}

          <Text style={styles.label}>Horário</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={horario} onValueChange={(v) => setHorario(String(v))}>
              <Picker.Item label="Selecione o horário" value="" />
              {HORARIOS.map((h) => (
                <Picker.Item key={h} label={h} value={h} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
              <Picker.Item label="Online" value="online" />
              <Picker.Item label="Presencial" value="presencial" />
            </Picker>
          </View>

          {tipo === 'presencial' && (
            <>
              <Text style={styles.label}>Localidade</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={localidade} onValueChange={(v) => setLocalidade(String(v))}>
                  <Picker.Item label="Selecione o local" value="" />
                  {LOCALIDADES.map((l) => (
                    <Picker.Item key={l} label={l} value={l} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          <View style={styles.acoes}>
            <Pressable style={[styles.botao, styles.botaoPrimario]} onPress={handleSalvar}>
              <Text style={styles.botaoPrimarioTexto}>Salvar</Text>
            </Pressable>
            <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={onCancelar}>
              <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  caixa: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 16, 
    },
  titulo: { 
    color: '#a755f7', 
    fontSize: 18, 
    fontWeight: 'bold' 
    },
  paciente: { 
    marginTop: 4, 
    color: '#333' 
    },
  label: { 
    marginTop: 12, 
    marginBottom: 4, 
    fontWeight: '500' 
    },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pickerBox: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    },
  acoes: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 20,
    },
  botao: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    },
  botaoPrimario: { 
    backgroundColor: '#a755f7', 
    },
  botaoPrimarioTexto: { 
    color: '#fff', 
    fontWeight: '600', 
    },
  botaoSecundario: { 
    borderWidth: 1, 
    borderColor: '#a755f7', 
    },
  botaoSecundarioTexto: { 
    color: '#a755f7', 
    fontWeight: '600',
    },
});