import type { StatusAgendamento } from '@/types/agendamento';
import { Agendamento, AgendamentoComPaciente, AgendamentoForm } from '@/types/agendamento';
import type { SQLiteDatabase } from 'expo-sqlite';

interface AgendamentoRow {
    id: number;
    paciente_id: number;
    data: string;
    localidade: string;
    status: string;
    criado_em: string;
}

type AgendamentoRowWithPaciente = AgendamentoRow & {
    paciente_id: number;
    paciente_nome: string;
};

function toAgendamento (row: AgendamentoRow): Agendamento {
    return {
        id: row.id,
        pacienteId: row.paciente_id,
        data: row.data,
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

export async function inserirAgendamento(db: SQLiteDatabase, dados: AgendamentoForm): Promise<number> {
    const result = await db.runAsync(
        'INSERT INTO agendamento (paciente_id, data, localidade, status, criado_em) VALUES (?, ?, ?, ?, ?)',
        [dados.pacienteId, dados.data, dados.localidade, dados.status, new Date().toISOString()]
    );
    return result.lastInsertRowId;
}

export async function listarAgendamentos(db: SQLiteDatabase): Promise<AgendamentoComPaciente[]> {
    const rows = await db.getAllAsync<AgendamentoRowWithPaciente>(
        `SELECT a.*, p.nome AS paciente_nome
         FROM agendamento a
         JOIN paciente p ON a.paciente_id = p.id
         ORDER BY a.data
        `);
    return rows.map(toAgendamentoComPaciente);
}

export async function atualizarStatusAgendamento(db: SQLiteDatabase, agendamentoId: number, novoStatus: StatusAgendamento): Promise<void> {
    await db.runAsync(
        'UPDATE agendamento SET status = ? WHERE id = ?',
        [novoStatus, agendamentoId]
    );
}

export async function buscarAgendamentoPorId(db: SQLiteDatabase, agendamentoId: number): Promise<AgendamentoComPaciente | null> {
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

export async function deletarAgendamento(db: SQLiteDatabase, agendamentoId: number): Promise<void> {
    await db.runAsync(
        'DELETE FROM agendamento WHERE id = ?',
        [agendamentoId]
    );
}

export async function atualizarAgendamento(db: SQLiteDatabase, agendamentoId: number, dados: AgendamentoForm): Promise<void> {
    await db.runAsync(
        'UPDATE agendamento SET paciente_id = ?, data = ?, localidade = ?, status = ? WHERE id = ?',
        [dados.pacienteId, dados.data, dados.localidade, dados.status, agendamentoId]
    );
}
