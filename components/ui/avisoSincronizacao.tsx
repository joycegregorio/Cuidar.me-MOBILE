import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { filaRepository } from '@/database/filaRepository';
import { aoMudarFila, avisarMudancaFila, sincronizarTudo } from '@/services/sincronizacao';
import type { ItemFila } from '@/types/fila';

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

function dataHoraCurta(dataHora?: string): string {
  if (!dataHora) return '';
  const [data, hora] = dataHora.split('T');
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes} às ${hora?.slice(0, 5) ?? ''}`;
}

function descrever(item: ItemFila): string {
  const dados = item.payload ? JSON.parse(item.payload) : {};
  switch (`${item.entidade}:${item.operacao}`) {
    case 'paciente:CRIAR':
      return `Cadastro do paciente ${dados.nome ?? ''}`.trim();
    case 'paciente:ATUALIZAR':
      return `Edição do paciente ${dados.nome ?? ''}`.trim();
    case 'paciente:EXCLUIR':
      return 'Exclusão de um paciente';
    case 'atendimento:CRIAR':
      return `Agendamento de ${dataHoraCurta(dados.data)}`;
    case 'atendimento:ATUALIZAR':
      return `Alteração do agendamento de ${dataHoraCurta(dados.data)}`;
    default:
      return 'Alteração';
  }
}

export default function AvisoSincronizacao() {
  const db = useSQLiteContext();
  const { isConnected } = useNetInfo();
  const offline = isConnected === false;

  const [pendentes, setPendentes] = useState(0);
  const [comErro, setComErro] = useState<ItemFila[]>([]);
  const [listaAberta, setListaAberta] = useState(false);

  useEffect(() => {
    let ativo = true;
    const atualizar = () =>
      Promise.all([filaRepository.contarPendentes(db), filaRepository.listarComErro(db)]).then(([qtd, erros]) => {
        if (!ativo) return;
        setPendentes(qtd);
        setComErro(erros);
        if (erros.length === 0) setListaAberta(false);
      });

    atualizar();
    const cancelar = aoMudarFila(atualizar);
    return () => {
      ativo = false;
      cancelar();
    };
  }, [db]);

  const tentarDeNovo = async (item: ItemFila) => {
    await filaRepository.tentarDeNovo(db, item.id);
    avisarMudancaFila();
    sincronizarTudo(db);
  };

  const descartar = (item: ItemFila) =>
    Alert.alert(
      'Descartar alteração',
      `"${descrever(item)}" não será enviada e será desfeita neste celular, junto com as alterações que dependem dela. Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            await filaRepository.descartar(db, item);
            avisarMudancaFila();
            // Baixar de novo traz a versão do servidor no lugar da descartada
            sincronizarTudo(db);
          },
        },
      ],
    );

  if (comErro.length > 0) {
    return (
      <>
        <Pressable style={[styles.faixa, styles.faixaErro]} onPress={() => setListaAberta(true)}>
          <Ionicons name="alert-circle" size={18} color="#991B1B" />
          <Text style={[styles.texto, styles.textoErro]}>
            {plural(comErro.length, 'alteração não pôde ser enviada', 'alterações não puderam ser enviadas')}. Toque para ver.
          </Text>
        </Pressable>

        <Modal visible={listaAberta} transparent animationType="slide" onRequestClose={() => setListaAberta(false)}>
          <View style={styles.fundo}>
            <View style={styles.painel}>
              <View style={styles.painelTopo}>
                <Text style={styles.painelTitulo}>Alterações com erro</Text>
                <Pressable onPress={() => setListaAberta(false)} hitSlop={8} accessibilityLabel="Fechar">
                  <Ionicons name="close" size={24} color="#5b00d2" />
                </Pressable>
              </View>

              <FlatList
                data={comErro}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Text style={styles.itemTitulo}>{descrever(item)}</Text>
                    <Text style={styles.itemErro}>{item.erro}</Text>
                    <View style={styles.itemBotoes}>
                      <Pressable style={styles.botao} onPress={() => tentarDeNovo(item)}>
                        <Text style={styles.botaoTexto}>Tentar de novo</Text>
                      </Pressable>
                      <Pressable style={[styles.botao, styles.botaoPerigo]} onPress={() => descartar(item)}>
                        <Text style={[styles.botaoTexto, styles.botaoTextoPerigo]}>Descartar</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  }

  if (offline) {
    return (
      <View style={[styles.faixa, styles.faixaOffline]}>
        <Ionicons name="cloud-offline-outline" size={18} color="#92400E" />
        <Text style={[styles.texto, styles.textoOffline]}>
          Sem internet.{' '}
          {pendentes > 0
            ? `${plural(pendentes, 'alteração será enviada', 'alterações serão enviadas')} quando a conexão voltar.`
            : 'Suas alterações ficam salvas no celular.'}
        </Text>
      </View>
    );
  }

  if (pendentes > 0) {
    return (
      <View style={[styles.faixa, styles.faixaEnviando]}>
        <Ionicons name="cloud-upload-outline" size={18} color="#5b00d2" />
        <Text style={[styles.texto, styles.textoEnviando]}>
          Enviando {plural(pendentes, 'alteração', 'alterações')}...
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  faixaErro: { backgroundColor: '#FEE2E2' },
  faixaOffline: { backgroundColor: '#FEF3C7' },
  faixaEnviando: { backgroundColor: '#F3E8FF' },
  texto: { flex: 1, fontSize: 14 },
  textoErro: { color: '#991B1B' },
  textoOffline: { color: '#92400E' },
  textoEnviando: { color: '#5b00d2' },
  fundo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  painel: {
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  painelTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  painelTitulo: { fontSize: 18, fontWeight: 'bold', color: '#5b00d2' },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitulo: { fontSize: 16, fontWeight: '600', color: '#1f1f1f' },
  itemErro: { fontSize: 14, color: '#991B1B', marginTop: 4 },
  itemBotoes: { flexDirection: 'row', gap: 12, marginTop: 10 },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5b00d2',
  },
  botaoPerigo: { borderColor: '#991B1B' },
  botaoTexto: { color: '#5b00d2', fontWeight: '600' },
  botaoTextoPerigo: { color: '#991B1B' },
});
