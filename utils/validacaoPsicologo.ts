import type { LoginForm, PsicologoCadastroForm } from '@/types/psicologo';

export const SENHA_TAMANHO_MINIMO = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailValido = (email: string) => EMAIL_REGEX.test(email.trim());

export const senhaForte = (senha: string) =>
  senha.length >= SENHA_TAMANHO_MINIMO && /[A-Za-z]/.test(senha) && /\d/.test(senha);

export type ErrosCadastro = Partial<Record<keyof PsicologoCadastroForm, string>>;
export type ErrosLogin = Partial<Record<keyof LoginForm, string>>;

export function validarCadastro(form: PsicologoCadastroForm): ErrosCadastro {
  const erros: ErrosCadastro = {};
  if (!form.nome.trim()) erros.nome = 'Informe o nome completo';
  if (!form.email.trim()) erros.email = 'Informe o e-mail';
  else if (!emailValido(form.email)) erros.email = 'E-mail inválido';
  if (!form.senha) erros.senha = 'Informe a senha';
  else if (!senhaForte(form.senha)) {
    erros.senha = `A senha precisa de ${SENHA_TAMANHO_MINIMO} ou mais caracteres, com letras e números`;
  }
  return erros;
}

export function validarLogin(form: LoginForm): ErrosLogin {
  const erros: ErrosLogin = {};
  if (!form.email.trim()) erros.email = 'Informe o e-mail';
  if (!form.senha) erros.senha = 'Informe a senha';
  return erros;
}
