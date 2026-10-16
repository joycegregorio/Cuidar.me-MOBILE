import type { SQLiteDatabase } from 'expo-sqlite';

import { psicologoRepository } from '@/database/psicologoRepository';
import type { LoginForm, Psicologo, PsicologoCadastroForm } from '@/types/psicologo';
import { gerarHash, gerarSalt, verificarSenha } from '@/utils/senha';
import { validarCadastro, validarLogin } from '@/utils/validacaoPsicologo';

export class AuthError extends Error {
  erros: Record<string, string>;

  constructor(message: string, erros: Record<string, string> = {}) {
    super(message);
    this.name = 'AuthError';
    this.erros = erros;
  }
}

const MENSAGEM_LOGIN_INVALIDO = 'E-mail ou senha inválidos.';
const MENSAGEM_EMAIL_DUPLICADO = 'Já existe um profissional cadastrado com este e-mail.';

const SALT_FALSO = '0'.repeat(32);

const normalizarEmail = (email: string) => email.trim().toLowerCase();

export async function cadastrarPsicologo(db: SQLiteDatabase, form: PsicologoCadastroForm): Promise<Psicologo> {
  const dados = { nome: form.nome.trim(), email: normalizarEmail(form.email), senha: form.senha };

  const erros = validarCadastro(dados);
  if (Object.keys(erros).length > 0) throw new AuthError('Corrija os campos destacados.', erros);

  if (await psicologoRepository.emailJaCadastrado(db, dados.email)) {
    throw new AuthError(MENSAGEM_EMAIL_DUPLICADO, { email: MENSAGEM_EMAIL_DUPLICADO });
  }

  const senhaSalt = await gerarSalt();
  const senhaHash = await gerarHash(dados.senha, senhaSalt);

  let id: number;
  try {
    id = await psicologoRepository.inserir(db, { nome: dados.nome, email: dados.email, senhaHash, senhaSalt });
  } catch (e) {
    if (e instanceof Error && /UNIQUE/i.test(e.message)) {
      throw new AuthError(MENSAGEM_EMAIL_DUPLICADO, { email: MENSAGEM_EMAIL_DUPLICADO });
    }
    throw e;
  }

  const psicologo = await psicologoRepository.buscarPorId(db, id);
  if (!psicologo) throw new Error('Profissional não encontrado após o cadastro.');
  return psicologo;
}

export async function autenticarPsicologo(db: SQLiteDatabase, form: LoginForm): Promise<Psicologo> {
  const dados = { email: normalizarEmail(form.email), senha: form.senha };

  const erros = validarLogin(dados);
  if (Object.keys(erros).length > 0) throw new AuthError('Preencha e-mail e senha.', erros);

  const credenciais = await psicologoRepository.buscarCredenciaisPorEmail(db, dados.email);
  if (!credenciais) {
    await gerarHash(dados.senha, SALT_FALSO);
    throw new AuthError(MENSAGEM_LOGIN_INVALIDO);
  }

  const senhaCorreta = await verificarSenha(dados.senha, credenciais.senhaSalt, credenciais.senhaHash);
  if (!senhaCorreta) throw new AuthError(MENSAGEM_LOGIN_INVALIDO);

  return credenciais.psicologo;
}
