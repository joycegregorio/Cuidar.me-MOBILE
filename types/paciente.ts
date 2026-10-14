export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
}

export interface ContatoEmergencia {
  nome: string;
  telefone: string;
  parentesco: string;
}

export interface PacienteForm {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  grauInstrucao: string;
  profissao: string;
  telefone: string;
  enderecoPessoal: Endereco;
  enderecoTrabalho: Endereco;
  contatoEmergencia: ContatoEmergencia;
  infoAdicionais: string;
}

export interface Paciente extends PacienteForm {
  id: number;
  criadoEm: string;
}
