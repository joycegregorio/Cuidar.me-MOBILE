
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { AuthError } from '@/services/authService';
import { type ErrosLogin, validarLogin } from '@/utils/validacaoPsicologo';

export default function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<ErrosLogin>({});
  const [entrando, setEntrando] = useState(false);

  const handleLogin = async () => {
    const novosErros = validarLogin({ email, senha });
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      Alert.alert('Atenção', 'Informe e-mail e senha.');
      return;
    }

    setEntrando(true);
    try {
      await entrar({ email, senha });
      router.replace('/(tabs)');
    } catch (error) {
      if (error instanceof AuthError) {
        setErros(error.erros as ErrosLogin);
        Alert.alert('Atenção', error.message);
      } else {
        console.error('Erro ao entrar:', error);
        Alert.alert('Erro', 'Não foi possível entrar. Tente novamente!');
      }
    } finally {
      setEntrando(false);
    }
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
                <View style={[styles.inputBox, erros.email ? styles.inputBoxErro : null]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu email"
                        value={email}
                        onChangeText={(v) => {
                            setEmail(v);
                            setErros((e) => ({ ...e, email: undefined }));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                {erros.email ? <Text style={styles.erro}>{erros.email}</Text> : null}

                <Text style={styles.label}>Senha</Text>
                <View style={[styles.inputBox, erros.senha ? styles.inputBoxErro : null]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        value={senha}
                        onChangeText={(v) => {
                            setSenha(v);
                            setErros((e) => ({ ...e, senha: undefined }));
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>
                {erros.senha ? <Text style={styles.erro}>{erros.senha}</Text> : null}
            </View>

            <Pressable
                style={[styles.botao, entrando && styles.botaoDesabilitado]}
                onPress={handleLogin}
                disabled={entrando}
            >
                {entrando ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.botaoTexto}>Entrar</Text>
                )}
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
  inputBoxErro: {
    borderColor: '#dc2626',
  },
  erro: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#333333',
  },
  botaoDesabilitado: {
    opacity: 0.6,
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
