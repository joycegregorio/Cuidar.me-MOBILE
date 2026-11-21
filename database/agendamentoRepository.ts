import type { StatusAgendamento } from '@/types/agendamento';
import { Agendamento, AgendamentoComPaciente, AgendamentoForm } from '@/types/agendamento';
import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

interface AgendamentoRow {
    id: string;
    paciente_id: string;
    data: string;
    horario: string;
    localidade: string;
    status: string;
    criado_em: string;
}

type AgendamentoRowWithPaciente = AgendamentoRow & {
    paciente_id: string;
    paciente_nome: string;
};

const hojeISO = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

function toAgendamento (row: AgendamentoRow): Agendamento {
    return {
        id: row.id,
        pacienteId: row.paciente_id,
        data: row.data,
        horario: row.horario,
        localidade: row.localidade,
        status: row.status as StatusAgendamento,
        criadoEm: row.criado_em,
    };
}

function toAgendamentoComPaciente (row: AgendamentoRowWithPaciente): AgendamentoComPaciente {
    return {
        ...toAgendamento(row),
        paciente: {
            id: row.paciente_id,
            nome: row.paciente_nome,
        },
    };
}

export async function inserirAgendamento(db: SQLiteDatabase, dados: AgendamentoForm): Promise<string> {
    const id = Crypto.randomUUID();
    await db.runAsync(
        'INSERT INTO agendamento (id, paciente_id, data, horario, localidade, status, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, dados.pacienteId, dados.data, dados.horario, dados.localidade, dados.status, new Date().toISOString()]
    );
    return id;
}

export async function listarAgendamentos(db: SQLiteDatabase): Promise<AgendamentoComPaciente[]> {
    const rows = await db.getAllAsync<AgendamentoRowWithPaciente>(
        `SELECT a.*, p.nome AS paciente_nome
         FROM agendamento a
         JOIN paciente p ON a.paciente_id = p.id
         ORDER BY a.data DESC, a.horario DESC, a.criado_em DESC
        `);
    return rows.map(toAgendamentoComPaciente);
}

export async function listarAgendamentosDoDia(db: SQLiteDatabase): Promise<AgendamentoComPaciente[]>{
    const rows = await db.getAllAsync<AgendamentoRowWithPaciente>(
        `SELECT a.*, p.nome AS paciente_nome
        FROM agendamento a
        JOIN paciente p ON a.paciente_id = p.id
        WHERE a.data = ? AND a.status IN ('PENDENTE', 'CONFIRMADO', 'REMARCADO')
        ORDER BY a.horario`,
        [hojeISO()],
    )
    return rows.map(toAgendamentoComPaciente);
}

export async function atualizarStatusAgendamento(db: SQLiteDatabase, agendamentoId: string, novoStatus: StatusAgendamento): Promise<void> {
    await db.runAsync(
        'UPDATE agendamento SET status = ? WHERE id = ?',
        [novoStatus, agendamentoId]
    );
}

export async function buscarAgendamentoPorId(db: SQLiteDatabase, agendamentoId: string): Promise<AgendamentoComPaciente | null> {
    const row = await db.getFirstAsync<AgendamentoRowWithPaciente>(
        `SELECT a.*, p.nome AS paciente_nome
         FROM agendamento a
         JOIN paciente p ON a.paciente_id = p.id
         WHERE a.id = ?
        `,
        [agendamentoId]
    );
    return row ? toAgendamentoComPaciente(row) : null;
}

export async function deletarAgendamento(db: SQLiteDatabase, agendamentoId: string): Promise<void> {
    await db.runAsync(
        'DELETE FROM agendamento WHERE id = ?',
        [agendamentoId]
    );
}

export async function atualizarAgendamento(db: SQLiteDatabase, agendamentoId: string, dados: AgendamentoForm): Promise<void> {
    await db.runAsync(
        'UPDATE agendamento SET paciente_id = ?, data = ?, horario = ?, localidade = ?, status = ? WHERE id = ?',
        [dados.pacienteId, dados.data, dados.horario, dados.localidade, dados.status, agendamentoId]
    );
}

