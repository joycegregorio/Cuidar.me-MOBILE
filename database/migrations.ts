import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'cuidarme.db';

const DATABASE_VERSION = 3;

const CRIAR_AGENDAMENTO = `
  CREATE TABLE agendamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    localidade TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO', 'REMARCADO')),
    criado_em TEXT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES paciente (id) ON DELETE CASCADE
  );
  CREATE INDEX idx_agendamento_paciente_id ON agendamento (paciente_id);
  CREATE INDEX idx_agendamento_data ON agendamento (data);
`;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON');
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
  if (currentVersion < 2) {
    await db.execAsync(CRIAR_AGENDAMENTO);
  }

  if (currentVersion < 3) {
    const tabela = await db.getFirstAsync<{ sql: string }>(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'agendamento'",
    );
    if (tabela?.sql.includes("' | '")) {
      await db.execAsync(`DROP TABLE agendamento; ${CRIAR_AGENDAMENTO}`);
    }
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
