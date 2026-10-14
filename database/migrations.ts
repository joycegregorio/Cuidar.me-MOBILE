import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'cuidarme.db';

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE paciente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        rg TEXT NOT NULL,
        data_nascimento TEXT NOT NULL,
        sexo TEXT NOT NULL,
        estado_civil TEXT NOT NULL,
        grau_instrucao TEXT NOT NULL,
        profissao TEXT NOT NULL,
        telefone TEXT NOT NULL,
        cep_pessoal TEXT NOT NULL,
        logradouro_pessoal TEXT NOT NULL,
        numero_pessoal TEXT,
        cidade_pessoal TEXT NOT NULL,
        estado_pessoal TEXT NOT NULL,
        cep_trabalho TEXT,
        logradouro_trabalho TEXT,
        numero_trabalho TEXT,
        cidade_trabalho TEXT,
        estado_trabalho TEXT,
        nome_contato_emergencia TEXT,
        telefone_contato_emergencia TEXT,
        parentesco_contato_emergencia TEXT,
        info_adicionais TEXT,
        criado_em TEXT NOT NULL
      );
      CREATE INDEX idx_paciente_nome ON paciente (nome);
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
