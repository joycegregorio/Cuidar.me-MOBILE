import type {SQLiteDatabase} from 'expo-sqlite';

export const anotacaoRepository = {
    async buscar(db: SQLiteDatabase, psicologoId: string, data: string): Promise<string> {
        const row = await db.getFirstAsync<{ texto: string }>(
            'SELECT texto FROM anotacao WHERE psicologo_id = ? AND data = ?',
            psicologoId,
            data
        );
        return row?.texto ?? '';
    },

    async salvar(db: SQLiteDatabase, psicologoId: string, data: string, texto: string): Promise<void> {
        await db.runAsync(
            `INSERT INTO anotacao (psicologo_id, data, texto, atualizado_em) VALUES (?, ?, ?, ?)
             ON CONFLICT(psicologo_id, data) DO UPDATE SET 
             texto = excluded.texto, 
             atualizado_em = excluded.atualizado_em`,
            psicologoId,
            data,
            texto,
            new Date().toISOString()
        );
    },
};