import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { psicologoRepository } from '@/database/psicologoRepository';
import { autenticarPsicologo, cadastrarPsicologo } from '@/services/authService';
import { limparSessao, lerSessao, salvarSessao } from '@/services/sessao';
import type { LoginForm, Psicologo, PsicologoCadastroForm } from '@/types/psicologo';

interface AuthContextValue {
  psicologo: Psicologo | null;
  carregando: boolean;
  cadastrar: (form: PsicologoCadastroForm) => Promise<void>;
  entrar: (form: LoginForm) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const id = await lerSessao();
        const encontrado = id === null ? null : await psicologoRepository.buscarPorId(db, id);
        if (id !== null && !encontrado) await limparSessao();
        if (ativo) setPsicologo(encontrado);
      } catch {
        if (ativo) setPsicologo(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [db]);

  const cadastrar = async (form: PsicologoCadastroForm) => {
    const novo = await cadastrarPsicologo(db, form);
    await salvarSessao(novo.id);
    setPsicologo(novo);
  };

  const entrar = async (form: LoginForm) => {
    const logado = await autenticarPsicologo(db, form);
    await salvarSessao(logado.id);
    setPsicologo(logado);
  };

  const sair = async () => {
    await limparSessao();
    setPsicologo(null);
  };

  return <AuthContext value={{ psicologo, carregando, cadastrar, entrar, sair }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  return contexto;
}
