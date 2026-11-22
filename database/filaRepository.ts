import type { SQLiteDatabase } from 'expo-sqlite';
import type { EntidadeFila, ItemFila, OperacaoFila } from '@/types/fila';

interface FilaRow {
    id: number;
    entidade: EntidadeFila;
    operacao: OperacaoFila;
    entidade_id: string;
    payload: string | null;
    criado_em: string;
    tentativas: number;
    erro: string | null;
}

function toFilaItem(r: FilaRow): ItemFila {
    return {
        id: r.id,
        entidade: r.entidade,
        operacao: r.operacao,
        entidadeId: r.entidade_id,
        payload: r.payload,
        criadoEm: r.criado_em,
        tentativas: r.tentativas,
        erro: r.erro
    };
}

export const filaRepository = {
    async enfileirar(
        db: SQLiteDatabase,
        entidade: EntidadeFila,
        operacao: OperacaoFila,
        entidadeId: string,
        payload?: unknown,
    ) : Promise<void> {
        await db.runAsync(
            'INSERT INTO fila_sincronizacao (entidade, operacao, entidade_id, payload, criado_em) VALUES (?, ?, ?, ?, ?)',
            entidade, 
            operacao, 
            entidadeId, 
            payload === undefined ? null : JSON.stringify(payload),
            new Date().toISOString(),
        );
    },

    async proximoPendente(db: SQLiteDatabase): Promise<ItemFila | null> {
        const row = await db.getFirstAsync<FilaRow>(
            `SELECT * FROM fila_sincronizacao f
             WHERE f.erro IS NULL
               AND NOT EXISTS (
                 SELECT 1 FROM fila_sincronizacao e
                 WHERE e.id < f.id
                   AND (e.entidade_id = f.entidade_id
                        OR (f.entidade = 'atendimento' AND e.entidade = 'paciente'
                            AND e.entidade_id = json_extract(f.payload, '$.pacienteId')))
               )
             ORDER BY f.id LIMIT 1`,
        );
        return row ? toFilaItem(row) : null;
    },

    async remover(db: SQLiteDatabase, id: number): Promise<void> {
        await db.runAsync('DELETE FROM fila_sincronizacao WHERE id = ?', id);
    },

    async registrarTentativa(db: SQLiteDatabase, id: number): Promise<void> {
        await db.runAsync(
            'UPDATE fila_sincronizacao SET tentativas = tentativas + 1 WHERE id = ?',
            id
        );
    },

    async marcarErro(db: SQLiteDatabase, id: number, mensagem: string): Promise<void> {
        await db.runAsync(
            'UPDATE fila_sincronizacao SET erro = ? WHERE id = ?',
            mensagem,
            id,
        );
    },

    async contarTodos(db: SQLiteDatabase): Promise<number> {
        const row = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) AS count FROM fila_sincronizacao',
        );
        return row?.count ?? 0;
    },

    async listarComErro(db: SQLiteDatabase): Promise<ItemFila[]> {
        const rows = await db.getAllAsync<FilaRow>(
            'SELECT * FROM fila_sincronizacao WHERE erro IS NOT NULL ORDER BY id',
        );
        return rows.map(toFilaItem);
    },

    async tentarDeNovo(db: SQLiteDatabase, id: number): Promise<void> {
        await db.runAsync('UPDATE fila_sincronizacao SET erro = NULL, tentativas = 0 WHERE id = ?', id);
    },

    async descartar(db: SQLiteDatabase, item: ItemFila): Promise<void> {
        await db.withTransactionAsync(async () => {
            const agendamentos = await db.getAllAsync<{ entidade_id: string }>(
                `SELECT DISTINCT entidade_id FROM fila_sincronizacao
                 WHERE entidade = 'atendimento' AND json_extract(payload, '$.pacienteId') = ?`,
                item.entidadeId,
            );
            const ids = [item.entidadeId, ...agendamentos.map((a) => a.entidade_id)];
            await db.runAsync(
                `DELETE FROM fila_sincronizacao
                 WHERE id >= ? AND entidade_id IN (SELECT value FROM json_each(?))`,
                item.id,
                JSON.stringify(ids),
            );
        });
    },

    async contarPendentes(db: SQLiteDatabase): Promise<number> {
        const row = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) AS count FROM fila_sincronizacao WHERE erro IS NULL',
        );
        return row?.count ?? 0;
    }
}
