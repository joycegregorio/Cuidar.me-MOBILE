import * as SecureStore from 'expo-secure-store';

const CHAVE_SESSAO = 'sessao.psicologoId';

export async function salvarSessao(psicologoId: number): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(CHAVE_SESSAO, String(psicologoId));
}

export async function lerSessao(): Promise<number | null> {
  if (!(await SecureStore.isAvailableAsync())) return null;
  const valor = await SecureStore.getItemAsync(CHAVE_SESSAO);
  const id = Number(valor);
  return valor !== null && Number.isInteger(id) && id > 0 ? id : null;
}

export async function limparSessao(): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}
