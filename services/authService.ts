import { ApiError, requisicaoApi } from '@/services/api';
import type { LoginForm, Psicologo, PsicologoCadastroForm } from '@/types/psicologo';
import { validarCadastro, validarLogin } from '@/utils/validacaoPsicologo';

export class AuthError extends Error {
  erros: Record<string, string>;

  constructor(message: string, erros: Record<string, string> = {}) {
    super(message);
    this.name = 'AuthError';
    this.erros = erros;
  }
}

interface PsicologoResposta {
  lookupId: string;
  nome: string;
  email: string;
}

const MENSAGEM_LOGIN_INVALIDO = 'E-mail ou senha inválidos.';
const MENSAGEM_EMAIL_DUPLICADO = 'Já existe um profissional cadastrado com este e-mail.';
const MENSAGEM_SEM_CONEXAO = 'Sem conexão com o servidor. É preciso estar conectado à internet para entrar ou se cadastrar.';

const normalizarEmail = (email: string) => email.trim().toLowerCase();

const toPsicologo = (r: PsicologoResposta): Psicologo => ({ id: r.lookupId, nome: r.nome, email: r.email });

function traduzirErro(error: unknown, mensagens: { 401?: string; 409?: string }): never {
  if (!(error instanceof ApiError)) throw error;

  if (error.status === 0) throw new AuthError(MENSAGEM_SEM_CONEXAO);
  if (error.status === 401 && mensagens[401]) throw new AuthError(mensagens[401]);
  if (error.status === 409 && mensagens[409]) {
    throw new AuthError(mensagens[409], { email: mensagens[409] });
  }
  if (error.status === 400) {
    throw new AuthError('Corrija os campos destacados.', error.erros);
  }
  throw new AuthError('O servidor está com problemas. Tente novamente em instantes.');
}

export async function cadastrarPsicologo(form: PsicologoCadastroForm): Promise<Psicologo> {
  const dados = { nome: form.nome.trim(), email: normalizarEmail(form.email), senha: form.senha };

  const erros = validarCadastro(dados);
  if (Object.keys(erros).length > 0) throw new AuthError('Corrija os campos destacados.', erros);

  try {
    const resposta = await requisicaoApi<PsicologoResposta>('POST', '/psicologos/cadastrar', dados);
    return toPsicologo(resposta);
  } catch (error) {
    traduzirErro(error, { 409: MENSAGEM_EMAIL_DUPLICADO });
  }
}

export async function autenticarPsicologo(form: LoginForm): Promise<Psicologo> {
  const dados = { email: normalizarEmail(form.email), senha: form.senha };

  const erros = validarLogin(dados);
  if (Object.keys(erros).length > 0) throw new AuthError('Preencha e-mail e senha.', erros);

  try {
    const resposta = await requisicaoApi<PsicologoResposta>('POST', '/psicologos/login', dados);
    return toPsicologo(resposta);
  } catch (error) {
    traduzirErro(error, { 401: MENSAGEM_LOGIN_INVALIDO });
  }
}
