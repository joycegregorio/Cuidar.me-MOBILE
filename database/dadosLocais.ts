import type { SQLiteDatabase } from 'expo-sqlite';

export async function limparDadosLocais(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM fila_sincronizacao;
      DELETE FROM agendamento;
      DELETE FROM paciente;
    `);
  });
}
