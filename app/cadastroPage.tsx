import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from '@/contexts/auth-context';
import { AuthError } from '@/services/authService';
import { type ErrosCadastro, validarCadastro } from '@/utils/validacaoPsicologo';

type Erros = ErrosCadastro & { confirmarSenha?: string };

export default function Cadastro(){
    const { cadastrar } = useAuth();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erros, setErros] = useState<Erros>({});
    const [cadastrando, setCadastrando] = useState(false);

    const limparErro = (campo: keyof Erros) => setErros((e) => ({ ...e, [campo]: undefined }));

    const handleCadastro = async () => {
        const novosErros: Erros = validarCadastro({ nome, email, senha });
        // A confirmação de senha só existe na tela, então é conferida aqui e não no serviço.
        if (!novosErros.senha && senha !== confirmarSenha) {
            novosErros.confirmarSenha = 'As senhas não conferem';
        }
        setErros(novosErros);
        if (Object.keys(novosErros).length > 0) {
            Alert.alert('Atenção', 'Corrija os campos destacados em vermelho.');
            return;
        }

        setCadastrando(true);
        try {
            await cadastrar({ nome, email, senha });
            Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
            router.replace('/(tabs)');
        } catch (error) {
            if (error instanceof AuthError) {
                setErros(error.erros as Erros);
                Alert.alert('Atenção', error.message);
            } else {
                console.error('Erro ao cadastrar:', error);
                Alert.alert('Erro', 'Não foi possível concluir o cadastro. Tente novamente!');
            }
        } finally {
            setCadastrando(false);
        }
    };

    return (
        <LinearGradient
            colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollConteudo}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>Realize seu Cadastro</Text>
                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados para cadastro</Text>
                        <Text style={styles.label}>Nome</Text>
                        <View style={[styles.inputBox, erros.nome ? styles.inputBoxErro : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu nome completo"
                                value={nome}
                                onChangeText={(v) => { setNome(v); limparErro('nome'); }}
                                autoCapitalize="words"
                            />
                        </View>
                        {erros.nome ? <Text style={styles.erro}>{erros.nome}</Text> : null}

                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputBox, erros.email ? styles.inputBoxErro : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu email"
                                value={email}
                                onChangeText={(v) => { setEmail(v); limparErro('email'); }}
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
                                onChangeText={(v) => { setSenha(v); limparErro('senha'); }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {erros.senha ? (
                            <Text style={styles.erro}>{erros.senha}</Text>
                        ) : (
                            <Text style={styles.dica}>Mínimo de 8 caracteres, com letras e números.</Text>
                        )}

                        <Text style={styles.label}>Confirmar senha</Text>
                        <View style={[styles.inputBox, erros.confirmarSenha ? styles.inputBoxErro : null]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Repita a senha"
                                value={confirmarSenha}
                                onChangeText={(v) => { setConfirmarSenha(v); limparErro('confirmarSenha'); }}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {erros.confirmarSenha ? <Text style={styles.erro}>{erros.confirmarSenha}</Text> : null}
                    </View>
                    <Pressable
                        style={[styles.botao, cadastrando && styles.botaoDesabilitado]}
                        onPress={handleCadastro}
                        disabled={cadastrando}
                    >
                        {cadastrando ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.botaoTexto}>Cadastrar</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.link} onPress={() => router.replace('/loginPage')}>
                        <Text style={styles.linkTexto}>Já tenho conta</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        alignItems: 'center',
    },
    scroll: {
        flex: 1,
        width: '100%',
    },
    scrollConteudo: {
        alignItems: 'center',
        paddingBottom: 24,
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
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        fontWeight: '500',
        color: '#333333',
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
        maxWidth: 250,
    },
    dica: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 10,
        maxWidth: 250,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        color: '#333333',
    },
    botao: {
        backgroundColor: '#a755f7',
        padding: 14,
        borderRadius: 100,
        gap: 4,
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
    link: {
        alignItems: 'center',
    },
    linkTexto: {
        color: '#a755f7',
        fontWeight: '600',
    },
});
