export interface PsicologoCadastroForm {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginForm {
  email: string;
  senha: string;
}

export interface Psicologo {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
}