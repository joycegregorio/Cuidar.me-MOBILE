import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const CONTATOS = [
  {
    nome: 'Jhennifer Kelly Nicolau da Cunha',
    email: 'jhenniferkelly@gmail.com',
    telefone: '(83) 91234-5678',
  },
  {
    nome: 'Joyce Gregório da Silva',
    email: 'joycegregorio@gmail.com',
    telefone: '(83) 98765-4321',
  },
];

export default function Contato() {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.botaoVoltar}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar para o login"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={20} color="#a755f7" />
      </Pressable>

      <Text style={styles.title}>Contatos</Text>

      {CONTATOS.map((contato) => (
        <View key={contato.email} style={styles.bloco}>
          <Text style={styles.nome}>{contato.nome}</Text>

          <View style={styles.linha}>
            <Ionicons name="mail" size={20} color="#a755f7" />
            <Text style={styles.info}>{contato.email}</Text>
          </View>

          <View style={styles.linha}>
            <Ionicons name="call" size={20} color="#a755f7" />
            <Text style={styles.info}>{contato.telefone}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#ffffff',
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
    padding: 2,
    marginBottom: 4,
  },
  title: {
    color: '#a755f7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bloco: {
    marginBottom: 24, 
  },
  nome: {
    color: '#1f1f1f',
    fontSize: 16,
    marginBottom: 6,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  info: {
    color: '#1f1f1f',
    fontSize: 16,
  },
});