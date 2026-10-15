import { Text, View } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import ButtonAgenda, {
    type AbaAgenda, 
} from '@/components/agendamento/ButtonAgenda';

export default function Agendamentos() {
    const [abaAtiva, setAbaAtiva] = useState<AbaAgenda>('novo');

  return (
    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <ButtonAgenda abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

        {abaAtiva === 'novo' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Agendamento de nova consulta</Text>
            </View>
        ) : null}
        {abaAtiva === 'consultas' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Consultas agendadas</Text>
            </View>
        ) : null}
    </LinearGradient>
  );
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});