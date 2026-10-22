import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AbaPaciente = 'novo' | 'cadastrados';

type PacienteTabsProps = {
  abaAtiva: AbaPaciente;
  onMudarAba: (aba: AbaPaciente) => void;
};

export default function ButtonPaciente({ abaAtiva, onMudarAba }: PacienteTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.botao, abaAtiva === 'novo' && styles.botaoAtivo]}
        onPress={() => onMudarAba('novo')}
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color={abaAtiva === 'novo' ? '#FFFFFF' : '#5b00d2'}
        />
        <Text style={[styles.textoBotao, abaAtiva === 'novo' && styles.textoBotaoAtivo]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Novo Paciente
        </Text>
      </Pressable>

      <Pressable
        style={[styles.botao, abaAtiva === 'cadastrados' && styles.botaoAtivo]}
        onPress={() => onMudarAba('cadastrados')}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={abaAtiva === 'cadastrados' ? '#FFFFFF' : '#5b00d2'}
        />
        <Text style={[styles.textoBotao, abaAtiva === 'cadastrados' && styles.textoBotaoAtivo]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          Pacientes Cadastrados
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#FFFFFF55',
  },
  botao: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  botaoAtivo: {
    backgroundColor: '#5b00d2',
  },
  textoBotao: {
    fontSize: 12,
    color: '#5b00d2',
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  textoBotaoAtivo: {
    color: '#FFFFFF',
  },
});
