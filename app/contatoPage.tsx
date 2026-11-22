import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const CONTATOS = [
  {
    nome: 'Jhennifer Kelly Nicolau da Cunha',
    email: 'jhenniferkelly@gmail.com',
    telefone: '(83) 99929-8063',
  },
  {
    nome: 'Joyce Gregório da Silva',
    email: 'joycegregorio@gmail.com',
    telefone: '(83) 98765-4321',
  },
];

const linkWhatsApp = (telefone: string) =>
  `https://wa.me/55${telefone.replace(/\D/g, '')}`;

async function abrirLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir', 'Verifique se há um aplicativo instalado para abrir este link.');
  }
}

export default function Contato() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Contatos</Text>

      {CONTATOS.map((contato) => (
        <View key={contato.email} style={styles.bloco}>
          <Text style={styles.nome}>{contato.nome}</Text>

          <Pressable
            style={styles.linha}
            onPress={() => abrirLink(`mailto:${contato.email}`)}
            accessibilityRole="link"
            accessibilityLabel={`Enviar e-mail para ${contato.nome}`}
          >
            <Ionicons name="mail" size={20} color="#a755f7" />
            <Text style={styles.link}>{contato.email}</Text>
          </Pressable>

          <Pressable
            style={styles.linha}
            onPress={() => abrirLink(linkWhatsApp(contato.telefone))}
            accessibilityRole="link"
            accessibilityLabel={`Conversar com ${contato.nome} no WhatsApp`}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#a755f7" />
            <Text style={styles.link}>{contato.telefone}</Text>
          </Pressable>
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
  link: {
    color: '#5b00d2',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});