import FundoGradiente from '@/components/ui/fundoGradiente';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const FUNCIONALIDADES = [
  { icone: 'document-text-outline', texto: 'Organização de prontuários' },
  { icone: 'calendar-outline', texto: 'Agendamento de consultas' },
  { icone: 'wallet-outline', texto: 'Controle financeiro' },
  { icone: 'chatbubbles-outline', texto: 'Comunicação com pacientes' },
  { icone: 'folder-open-outline', texto: 'Gestão de documentos' },
] as const;

export default function Sobre() {
  return (
    <FundoGradiente style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.titulo}>Sobre o Cuidar.me</Text>

        <View style={styles.card}>
          <Text style={styles.descricao}>
            O Cuidar.me é um sistema em desenvolvimento para otimizar a
            rotina administrativa de psicólogos. Em um cenário onde o excesso
            de tarefas manuais pode comprometer a qualidade do atendimento, ele
            surge como uma solução completa para o dia a dia do consultório.
          </Text>

          <Text style={styles.subtitulo}>O que você encontra</Text>

          {FUNCIONALIDADES.map((item) => (
            <View key={item.texto} style={styles.linha}>
              <View style={styles.iconeCirculo}>
                <Ionicons name={item.icone} size={18} color="#a755f7" />
              </View>
              <Text style={styles.itemTexto}>{item.texto}</Text>
            </View>
          ))}

          <View style={styles.lgpd}>
            <Ionicons name="shield-checkmark" size={22} color="#a755f7" />
            <Text style={styles.lgpdTexto}>
              Tudo com foco em segurança e conformidade com a Lei Geral de
              Proteção de Dados (nº 13.709/2018).
            </Text>
          </View>
        </View>
      </ScrollView>
    </FundoGradiente>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  titulo: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
  },
  descricao: {
    color: '#3b3b3b',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  subtitulo: {
    color: '#a755f7',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconeCirculo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexto: {
    flex: 1,
    color: '#3b3b3b',
    fontSize: 16,
  },
  lgpd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  lgpdTexto: {
    flex: 1,
    color: '#3b3b3b',
    fontSize: 14,
    lineHeight: 20,
  },
});