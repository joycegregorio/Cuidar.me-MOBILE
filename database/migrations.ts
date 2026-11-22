import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'cuidarme.db';

const DATABASE_VERSION = 10;

const CRIAR_AGENDAMENTO = `
  CREATE TABLE agendamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    localidade TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO', 'REMARCADO')),
    criado_em TEXT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES paciente (id) ON DELETE CASCADE
  );
  CREATE INDEX idx_agendamento_paciente_id ON agendamento (paciente_id);
  CREATE INDEX idx_agendamento_data ON agendamento (data);
`;

const CRIAR_PACIENTE_V6 = `
  CREATE TABLE paciente (
    id TEXT PRIMARY KEY NOT NULL,
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
`;

const CRIAR_AGENDAMENTO_V6 = `
  CREATE TABLE agendamento (
    id TEXT PRIMARY KEY NOT NULL,
    paciente_id TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    localidade TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO', 'REMARCADO')),
    criado_em TEXT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES paciente (id) ON DELETE CASCADE
  );
  CREATE INDEX idx_agendamento_paciente_id ON agendamento (paciente_id);
  CREATE INDEX idx_agendamento_data ON agendamento (data);
`;

const CRIAR_FILA_V7 = `
  CREATE TABLE fila_sincronizacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade TEXT NOT NULL CHECK (entidade IN ('paciente', 'atendimento')),
    operacao TEXT NOT NULL CHECK (operacao IN ('CRIAR', 'ATUALIZAR', 'EXCLUIR')),
    entidade_id TEXT NOT NULL,
    payload TEXT,
    criado_em TEXT NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    erro TEXT
  );
`;

const CRIAR_ANOTACAO_V8 = `
  CREATE TABLE anotacao (
    psicologo_id TEXT NOT NULL,
    data TEXT NOT NULL,
    texto TEXT NOT NULL,
    atualizado_em TEXT NOT NULL,
    PRIMARY KEY (psicologo_id, data)
  );
`;

const criarAgendamentoV10 = (tabela: string) => `
  CREATE TABLE ${tabela} (
    id TEXT PRIMARY KEY NOT NULL,
    paciente_id TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    localidade TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('AGENDADO', 'CONCLUIDO', 'CANCELADO', 'REMARCADO')),
    criado_em TEXT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES paciente (id) ON DELETE CASCADE
  );
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

  if (currentVersion < 4) {
    await db.execAsync(`
      CREATE TABLE psicologo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        senha_hash TEXT NOT NULL,
        senha_salt TEXT NOT NULL,
        criado_em TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 5) {
    const colunas = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(agendamento)',
    );
    const temHorario = colunas.some((c) => c.name === 'horario');

    if (!temHorario) {
      await db.execAsync(`ALTER TABLE agendamento ADD COLUMN horario TEXT NOT NULL DEFAULT ' ';
        UPDATE agendamento
        SET horario = substr(data, 12, 5), data = substr(data, 1, 10)
        WHERE data LIKE '%T%';
      `);
    }
  }

  if (currentVersion < 6) {
    await db.execAsync(`
      DROP TABLE IF EXISTS agendamento;
      DROP TABLE IF EXISTS paciente;
      ${CRIAR_PACIENTE_V6}
      ${CRIAR_AGENDAMENTO_V6}
    `);
  }
  
  if (currentVersion <  7) {
    await db.execAsync(CRIAR_FILA_V7);
  }

  if (currentVersion < 8) {
    await db.execAsync(CRIAR_ANOTACAO_V8);
  }

  if (currentVersion < 9) {
    await db.execAsync('DROP TABLE IF EXISTS psicologo');
  }

  if (currentVersion < 10) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ${criarAgendamentoV10('agendamento_v10')}
        INSERT INTO agendamento_v10 (id, paciente_id, data, horario, localidade, status, criado_em)
          SELECT id, paciente_id, data, horario, localidade,
            CASE status
              WHEN 'PENDENTE' THEN 'AGENDADO'
              WHEN 'CONFIRMADO' THEN 'AGENDADO'
              WHEN 'REALIZADO' THEN 'CONCLUIDO'
              ELSE status
            END,
            criado_em
          FROM agendamento;
        DROP TABLE agendamento;
        ALTER TABLE agendamento_v10 RENAME TO agendamento;
        CREATE INDEX idx_agendamento_paciente_id ON agendamento (paciente_id);
        CREATE INDEX idx_agendamento_data ON agendamento (data);
      `);
    });
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
