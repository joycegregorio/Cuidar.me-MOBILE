import type { SQLiteDatabase } from 'expo-sqlite';

import { requisicaoApi } from '@/services/api';
import { separarDataHorario } from '@/utils/data';

interface EnderecoApi {
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  cidade: string | null;
  estado: string | null;
}

interface PacienteApi {
  lookupId: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  grauInstrucao: string;
  profissao: string;
  telefone: string;
  enderecoPessoal: EnderecoApi | null;
  enderecoTrabalho: EnderecoApi | null;
  contatoEmergencia: { nome: string | null; telefone: string | null; parentesco: string | null } | null;
  infoAdicionais: string | null;
  atualizadoEm: string | null;
}

interface AtendimentoApi {
  lookupId: string;
  data: string;
  localidade: string;
  status: string;
  pacienteId: string;
  atualizadoEm: string | null;
}

type Ouvinte = () => void;
const ouvintes = new Set<Ouvinte>();

export function aoBaixarDados(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export async function baixarDados(db: SQLiteDatabase, psicologoId: string): Promise<void> {
  const [pacientes, atendimentos] = await Promise.all([
    requisicaoApi<PacienteApi[]>('GET', `/psicologos/pacientes/${psicologoId}`),
    requisicaoApi<AtendimentoApi[]>('GET', `/psicologos/atendimentos/${psicologoId}`),
  ]);

  await db.withTransactionAsync(async () => {
    const naFila = new Set(
      (await db.getAllAsync<{ entidade_id: string }>('SELECT DISTINCT entidade_id FROM fila_sincronizacao'))
        .map((r) => r.entidade_id),
    );

    for (const p of pacientes) {
      if (naFila.has(p.lookupId)) continue;
      await salvarPaciente(db, p);
    }

    await db.runAsync(
      `DELETE FROM paciente
       WHERE id NOT IN (SELECT value FROM json_each(?))
         AND id NOT IN (SELECT entidade_id FROM fila_sincronizacao)`,
      JSON.stringify(pacientes.map((p) => p.lookupId)),
    );

    for (const a of atendimentos) {
      if (naFila.has(a.lookupId)) continue;
      await salvarAtendimento(db, a);
    }

    await db.runAsync(
      `DELETE FROM agendamento
       WHERE id NOT IN (SELECT value FROM json_each(?))
         AND id NOT IN (SELECT entidade_id FROM fila_sincronizacao)`,
      JSON.stringify(atendimentos.map((a) => a.lookupId)),
    );
  });

  ouvintes.forEach((ouvinte) => ouvinte());
}

async function salvarPaciente(db: SQLiteDatabase, p: PacienteApi): Promise<void> {
  const pes = p.enderecoPessoal;
  const tra = p.enderecoTrabalho;
  const con = p.contatoEmergencia;
  try {
    await db.runAsync(
      `INSERT INTO paciente (id, nome, cpf, rg, data_nascimento, sexo, estado_civil, grau_instrucao, profissao, telefone,
         cep_pessoal, logradouro_pessoal, numero_pessoal, cidade_pessoal, estado_pessoal,
         cep_trabalho, logradouro_trabalho, numero_trabalho, cidade_trabalho, estado_trabalho,
         nome_contato_emergencia, telefone_contato_emergencia, parentesco_contato_emergencia, info_adicionais, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nome = excluded.nome, cpf = excluded.cpf, rg = excluded.rg, data_nascimento = excluded.data_nascimento,
         sexo = excluded.sexo, estado_civil = excluded.estado_civil, grau_instrucao = excluded.grau_instrucao,
         profissao = excluded.profissao, telefone = excluded.telefone,
         cep_pessoal = excluded.cep_pessoal, logradouro_pessoal = excluded.logradouro_pessoal,
         numero_pessoal = excluded.numero_pessoal, cidade_pessoal = excluded.cidade_pessoal,
         estado_pessoal = excluded.estado_pessoal,
         cep_trabalho = excluded.cep_trabalho, logradouro_trabalho = excluded.logradouro_trabalho,
         numero_trabalho = excluded.numero_trabalho, cidade_trabalho = excluded.cidade_trabalho,
         estado_trabalho = excluded.estado_trabalho,
         nome_contato_emergencia = excluded.nome_contato_emergencia,
         telefone_contato_emergencia = excluded.telefone_contato_emergencia,
         parentesco_contato_emergencia = excluded.parentesco_contato_emergencia,
         info_adicionais = excluded.info_adicionais`,
      p.lookupId, p.nome, p.cpf, p.rg, p.dataNascimento, p.sexo, p.estadoCivil, p.grauInstrucao, p.profissao, p.telefone,
      pes?.cep ?? '', pes?.logradouro ?? '', pes?.numero ?? null, pes?.cidade ?? '', pes?.estado ?? '',
      tra?.cep ?? null, tra?.logradouro ?? null, tra?.numero ?? null, tra?.cidade ?? null, tra?.estado ?? null,
      con?.nome ?? null, con?.telefone ?? null, con?.parentesco ?? null, p.infoAdicionais ?? null,
      p.atualizadoEm ?? new Date().toISOString(),
    );
  } catch (error) {
    console.warn(`Paciente ${p.lookupId} não foi baixado:`, error);
  }
}

async function salvarAtendimento(db: SQLiteDatabase, a: AtendimentoApi): Promise<void> {
  const { data, horario } = separarDataHorario(a.data);
  try {
    await db.runAsync(
      `INSERT INTO agendamento (id, paciente_id, data, horario, localidade, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         paciente_id = excluded.paciente_id, data = excluded.data, horario = excluded.horario,
         localidade = excluded.localidade, status = excluded.status`,
      a.lookupId, a.pacienteId, data, horario, a.localidade, a.status,
      a.atualizadoEm ?? new Date().toISOString(),
    );
  } catch (error) {
    console.warn(`Agendamento ${a.lookupId} não foi baixado:`, error);
  }
}
