
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu e-mail.');
      return;
    }

    if (!senha) {
      Alert.alert('Atenção', 'Informe sua senha.');
      return;
    }

    router.push('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <Text style={styles.title}>Realize seu Login</Text>
        <View style={styles.card}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Dados de acesso
                </Text>

                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <Pressable
                style={styles.botao}
                onPress={handleLogin}
            >
                <Text style={styles.botaoTexto}>Entrar</Text>
            </Pressable>

            <Pressable
                style={styles.botao}
                onPress={() => router.push('/cadastroPage')}
            >
                <Text style={styles.botaoTexto}>Cadastrar</Text>
            </Pressable>
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  title: {
    color: '#fcfbfd',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#a755f7',
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
    color: '#a51cd3',

  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    minHeight: 44,
    minWidth: 250,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#333333',
  },
  botao: {
    backgroundColor: '#a755f7',
    padding: 14,
    gap: 16,
    marginBottom: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    marginTop: 4,
  },
});
