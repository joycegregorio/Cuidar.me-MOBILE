import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";


export default function Cadastro(){
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <LinearGradient
            colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Realize seu Cadastro</Text>
                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados para cadastro</Text>
                        <Text style={styles.label}>Nome</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu e-mail"
                                value={nome}
                                onChangeText={setNome}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputBox}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu email"
                                value={email}
                                onChangeText={setEmail}
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
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>
                    <Pressable style={styles.botao} onPress={() =>  router.push('/loginPage')}>
                        <Text style={styles.botaoTexto}>Cadastrar</Text>
                    </Pressable>

                </View>

            </View>
        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        color: '#fcfbfd',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,

    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginTop: 16,
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
    botaoTexto: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
        marginTop: 4,
    },
});