import * as SecureStore from 'expo-secure-store';

import type { Psicologo } from '@/types/psicologo';

const CHAVE_SESSAO = 'sessao.psicologo';
const CHAVE_SESSAO_ANTIGA = 'sessao.psicologoId';

export async function salvarSessao(psicologo: Psicologo): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(psicologo));
}

export async function lerSessao(): Promise<Psicologo | null> {
  if (!(await SecureStore.isAvailableAsync())) return null;

  if (await SecureStore.getItemAsync(CHAVE_SESSAO_ANTIGA)) {
    await SecureStore.deleteItemAsync(CHAVE_SESSAO_ANTIGA);
  }

  const valor = await SecureStore.getItemAsync(CHAVE_SESSAO);
  if (!valor) return null;
  try {
    const dados = JSON.parse(valor) as Partial<Psicologo>;
    if (typeof dados.id === 'string' && typeof dados.nome === 'string' && typeof dados.email === 'string') {
      return { id: dados.id, nome: dados.nome, email: dados.email };
    }
  } catch {
  }
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
  return null;
}

export async function limparSessao(): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}
