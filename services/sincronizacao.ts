import type { SQLiteDatabase } from 'expo-sqlite';

import { filaRepository } from '@/database/filaRepository';
import { ApiError, requisicaoApi } from '@/services/api';
import { baixarDados } from '@/services/baixarDados';
import { lerSessao } from '@/services/sessao';
import type { ItemFila } from '@/types/fila';

interface Requisicao {
    metodo: string,
    caminho: string,
    corpo?: unknown,
}

function montarRequisicao(item: ItemFila): Requisicao {
    const corpo = item.payload ? JSON.parse(item.payload) : undefined;

    switch(`${item.entidade}:${item.operacao}`){
        case 'paciente:CRIAR': {
            const { psicologoId, ...dados } = corpo;
            return {
                metodo: 'POST',
                caminho: `/psicologos/cadastrar-pacientes/${psicologoId}`,
                corpo: dados,
            };
        }
        case 'paciente:ATUALIZAR':
            return {
                metodo: 'PATCH',
                caminho: `/pacientes/atualizar/${item.entidadeId}`,
                corpo,
            };
        case 'paciente:EXCLUIR':
            return {
                metodo: 'DELETE',
                caminho: `/pacientes/remover/${item.entidadeId}`,
            };
        case 'atendimento:CRIAR': {
            const { pacienteId, ...dados } = corpo;
            return {
                metodo: 'POST',
                caminho: `/pacientes/cadastrar-atendimentos/${pacienteId}`,
                corpo: dados,
            };
        }
        case 'atendimento:ATUALIZAR':
            return {
                metodo: 'PATCH',
                caminho: `/atendimentos/atualizar/${item.entidadeId}`,
                corpo,
            };

        default:
            throw new Error(`Operação não suportada: ${item.entidade}:${item.operacao}`);

    }
}

type Ouvinte = () => void;
const ouvintesFila = new Set<Ouvinte>();

export function aoMudarFila(ouvinte: Ouvinte): () => void {
    ouvintesFila.add(ouvinte);
    return () => {
        ouvintesFila.delete(ouvinte);
    };
}

export function avisarMudancaFila(): void {
    ouvintesFila.forEach((ouvinte) => ouvinte());
}

let sincronizando = false;
let pedirDeNovo = false;

export async function sincronizarFila(db: SQLiteDatabase): Promise<void> {
    if(sincronizando) {
        pedirDeNovo = true;
        return;
    }
    sincronizando = true;
    pedirDeNovo = false;

    try {
        while(true){
            const item = await filaRepository.proximoPendente(db);
            if(!item) break;
            try {
                const { metodo, caminho, corpo } = montarRequisicao(item);
                await requisicaoApi(metodo, caminho, corpo);
                await filaRepository.remover(db, item.id);
            } catch (error) {
                if(error instanceof ApiError && error.podeTentarNovamente){
                    await filaRepository.registrarTentativa(db, item.id);
                    break;
                } 

                const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
                await filaRepository.marcarErro(db, item.id, mensagem);
            }
        }
    } finally {
        sincronizando = false;
        avisarMudancaFila();
    }

    if(pedirDeNovo) {
        await sincronizarFila(db);
    }
}

let temporizador: ReturnType<typeof setTimeout> | null = null;

export function agendarSincronizacao(db: SQLiteDatabase): void {
    avisarMudancaFila();
    if(temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(() => {
        temporizador = null;
        sincronizarFila(db);
    }, 1000);
}

let baixando = false;

export async function sincronizarTudo(db: SQLiteDatabase): Promise<void> {
    await sincronizarFila(db);

    if(baixando) return;
    baixando = true;
    try {
        const psicologo = await lerSessao();
        if(psicologo) await baixarDados(db, psicologo.id);
    } catch (error) {
        console.warn('Não foi possível baixar os dados do servidor:', error);
    } finally {
        baixando = false;
    }
}
