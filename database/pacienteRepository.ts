import type { SQLiteDatabase } from 'expo-sqlite';
import type { Paciente, PacienteForm } from '@/types/paciente';

interface PacienteRow {
  id: number;
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  sexo: string;
  estado_civil: string;
  grau_instrucao: string;
  profissao: string;
  telefone: string;
  cep_pessoal: string;
  logradouro_pessoal: string;
  numero_pessoal: string | null;
  cidade_pessoal: string;
  estado_pessoal: string;
  cep_trabalho: string | null;
  logradouro_trabalho: string | null;
  numero_trabalho: string | null;
  cidade_trabalho: string | null;
  estado_trabalho: string | null;
  nome_contato_emergencia: string | null;
  telefone_contato_emergencia: string | null;
  parentesco_contato_emergencia: string | null;
  info_adicionais: string | null;
  criado_em: string;
}

function toPaciente(r: PacienteRow): Paciente {
  return {
    id: r.id,
    criadoEm: r.criado_em,
    nome: r.nome,
    cpf: r.cpf,
    rg: r.rg,
    dataNascimento: r.data_nascimento,
    sexo: r.sexo,
    estadoCivil: r.estado_civil,
    grauInstrucao: r.grau_instrucao,
    profissao: r.profissao,
    telefone: r.telefone,
    enderecoPessoal: {
      cep: r.cep_pessoal,
      logradouro: r.logradouro_pessoal,
      numero: r.numero_pessoal ?? '',
      cidade: r.cidade_pessoal,
      estado: r.estado_pessoal,
    },
    enderecoTrabalho: {
      cep: r.cep_trabalho ?? '',
      logradouro: r.logradouro_trabalho ?? '',
      numero: r.numero_trabalho ?? '',
      cidade: r.cidade_trabalho ?? '',
      estado: r.estado_trabalho ?? '',
    },
    contatoEmergencia: {
      nome: r.nome_contato_emergencia ?? '',
      telefone: r.telefone_contato_emergencia ?? '',
      parentesco: r.parentesco_contato_emergencia ?? '',
    },
    infoAdicionais: r.info_adicionais ?? '',
  };
}

function toParams(p: PacienteForm) {
  return [
    p.nome,
    p.cpf,
    p.rg,
    p.dataNascimento,
    p.sexo,
    p.estadoCivil,
    p.grauInstrucao,
    p.profissao,
    p.telefone,
    p.enderecoPessoal.cep,
    p.enderecoPessoal.logradouro,
    p.enderecoPessoal.numero,
    p.enderecoPessoal.cidade,
    p.enderecoPessoal.estado,
    p.enderecoTrabalho.cep,
    p.enderecoTrabalho.logradouro,
    p.enderecoTrabalho.numero,
    p.enderecoTrabalho.cidade,
    p.enderecoTrabalho.estado,
    p.contatoEmergencia.nome,
    p.contatoEmergencia.telefone,
    p.contatoEmergencia.parentesco,
    p.infoAdicionais,
  ];
}

const COLUNAS = `nome, cpf, rg, data_nascimento, sexo, estado_civil, grau_instrucao, profissao, telefone,
  cep_pessoal, logradouro_pessoal, numero_pessoal, cidade_pessoal, estado_pessoal,
  cep_trabalho, logradouro_trabalho, numero_trabalho, cidade_trabalho, estado_trabalho,
  nome_contato_emergencia, telefone_contato_emergencia, parentesco_contato_emergencia, info_adicionais`;

export const pacienteRepository = {
  async listar(db: SQLiteDatabase, busca = ''): Promise<Paciente[]> {
    const termo = `%${busca.trim()}%`;
    const rows = await db.getAllAsync<PacienteRow>(
      'SELECT * FROM paciente WHERE nome LIKE ? OR cpf LIKE ? ORDER BY nome COLLATE NOCASE',
      termo,
      termo,
    );
    return rows.map(toPaciente);
  },

  async buscarPorId(db: SQLiteDatabase, id: number): Promise<Paciente | null> {
    const row = await db.getFirstAsync<PacienteRow>('SELECT * FROM paciente WHERE id = ?', id);
    return row ? toPaciente(row) : null;
  },

  async cpfJaCadastrado(db: SQLiteDatabase, cpf: string, ignorarId?: number): Promise<boolean> {
    const row = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM paciente WHERE cpf = ? AND id != ?',
      cpf,
      ignorarId ?? -1,
    );
    return row !== null;
  },

  async inserir(db: SQLiteDatabase, dados: PacienteForm): Promise<number> {
    const result = await db.runAsync(
      `INSERT INTO paciente (${COLUNAS}, criado_em) VALUES (${'?, '.repeat(23)}?)`,
      ...toParams(dados),
      new Date().toISOString(),
    );
    return result.lastInsertRowId;
  },

  async atualizar(db: SQLiteDatabase, id: number, dados: PacienteForm): Promise<void> {
    const sets = COLUNAS.split(',').map((c) => `${c.trim()} = ?`).join(', ');
    await db.runAsync(`UPDATE paciente SET ${sets} WHERE id = ?`, ...toParams(dados), id);
  },

  async remover(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM paciente WHERE id = ?', id);
  },
};
