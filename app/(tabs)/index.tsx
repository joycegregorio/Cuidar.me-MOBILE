import { ScrollView, StyleSheet, View, Text} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Psicologo = {
  id: number;
  nome: string;
}

export default function HomeScreen() {
  return (

    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <ScrollView style={styles.conteudo}>
          <View style={styles.boasVindas}>
            <Text type="title" style={styles.titulo}>
              Bem-vindo(a)!
            </Text>
            <Text type="subtitle" style={styles.subtitulo}>
              Veja suas informações.
            </Text>
          </View>

        <View style={styles.cards}>
          <View style={styles.card}>
            <ThemedText type="title" style={styles.cardTitle}>
              Pacientes
            </ThemedText>
            <ThemedText type="subtitle" style={styles.cardSubtitle}>
              Gerencie seus pacientes
            </ThemedText>
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
  }
});
