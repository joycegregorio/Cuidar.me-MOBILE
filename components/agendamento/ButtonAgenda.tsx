import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export type AbaAgenda = 'novo' | 'consultas';

type AgendaTabsProps = {
  abaAtiva: AbaAgenda;
  onMudarAba: (aba: AbaAgenda) => void;
};

export default function ButtonAgenda({
  abaAtiva,
  onMudarAba,
}: AgendaTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.botao,
          abaAtiva === 'novo' && styles.botaoAtivo,
        ]}
        onPress={() => onMudarAba('novo')}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={abaAtiva === 'novo' ? '#FFFFFF' : '#5b00d2'}
        />
        <Text
          style={[
            styles.textoBotao,
            abaAtiva === 'novo' && styles.textoBotaoAtivo,
          ]}
        >
          Novo
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.botao,
          abaAtiva === 'consultas' && styles.botaoAtivo,
        ]}
        onPress={() => onMudarAba('consultas')}
      >
        <FontAwesome5
          name="clipboard-list"
          size={19}
          color={abaAtiva === 'consultas' ? '#FFFFFF' : '#5b00d2'}
        />
        <Text
          style={[
            styles.textoBotao,
            abaAtiva === 'consultas' && styles.textoBotaoAtivo,
          ]}
        >
          Consultas Agendadas
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