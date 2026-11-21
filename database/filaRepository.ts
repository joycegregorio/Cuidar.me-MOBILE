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
            'SELECT * FROM fila_sincronizacao WHERE erro IS NULL ORDER BY id LIMIT 1',
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

    async contarPendentes(db: SQLiteDatabase): Promise<number> {
        const row = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) AS count FROM fila_sincronizacao WHERE erro IS NULL',
        );
        return row?.count ?? 0;
    }
}
