import type { SQLiteDatabase } from 'expo-sqlite';
import type { Psicologo } from '@/types/psicologo';

interface PsicologoRow {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  senha_salt: string;
  criado_em: string;
}

function toPsicologo(r: PsicologoRow): Psicologo {
  return { id: r.id, nome: r.nome, email: r.email, criadoEm: r.criado_em };
}

export interface NovoPsicologo {
  nome: string;
  email: string;
  senhaHash: string;
  senhaSalt: string;
}

export interface CredenciaisPsicologo {
  psicologo: Psicologo;
  senhaHash: string;
  senhaSalt: string;
}

export const psicologoRepository = {
  async emailJaCadastrado(db: SQLiteDatabase, email: string): Promise<boolean> {
    const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM psicologo WHERE email = ?', email);
    return row !== null;
  },

  async inserir(db: SQLiteDatabase, dados: NovoPsicologo): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO psicologo (nome, email, senha_hash, senha_salt, criado_em) VALUES (?, ?, ?, ?, ?)',
      dados.nome,
      dados.email,
      dados.senhaHash,
      dados.senhaSalt,
      new Date().toISOString(),
    );
    return result.lastInsertRowId;
  },

  async buscarPorId(db: SQLiteDatabase, id: number): Promise<Psicologo | null> {
    const row = await db.getFirstAsync<PsicologoRow>('SELECT * FROM psicologo WHERE id = ?', id);
    return row ? toPsicologo(row) : null;
  },

  async buscarCredenciaisPorEmail(db: SQLiteDatabase, email: string): Promise<CredenciaisPsicologo | null> {
    const row = await db.getFirstAsync<PsicologoRow>('SELECT * FROM psicologo WHERE email = ?', email);
    return row ? { psicologo: toPsicologo(row), senhaHash: row.senha_hash, senhaSalt: row.senha_salt } : null;
  },
};
