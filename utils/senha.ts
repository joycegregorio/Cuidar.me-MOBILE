import * as Crypto from 'expo-crypto';

const TAMANHO_SALT_BYTES = 16;

export async function gerarSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(TAMANHO_SALT_BYTES);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function gerarHash(senha: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${senha.normalize('NFC')}`);
}

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export async function verificarSenha(senha: string, salt: string, hashSalvo: string): Promise<boolean> {
  return iguais(await gerarHash(senha, salt), hashSalvo);
}
