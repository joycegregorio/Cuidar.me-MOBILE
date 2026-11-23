import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { limparDadosLocais } from '@/database/dadosLocais';
import { autenticarPsicologo, cadastrarPsicologo } from '@/services/authService';
import { limparSessao, lerSessao, salvarSessao } from '@/services/sessao';
import { sincronizarTudo } from '@/services/sincronizacao';
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
        const salvo = await lerSessao();
        if (ativo) setPsicologo(salvo);
      } catch {
        if (ativo) setPsicologo(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const cadastrar = async (form: PsicologoCadastroForm) => {
    const novo = await cadastrarPsicologo(form);
    await salvarSessao(novo);
    setPsicologo(novo);
  };

  const entrar = async (form: LoginForm) => {
    const logado = await autenticarPsicologo(form);
    await salvarSessao(logado);
    setPsicologo(logado);
    sincronizarTudo(db);
  };

  const sair = async () => {
    await limparDadosLocais(db);
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
