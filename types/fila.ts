export type EntidadeFila = 'paciente' | 'atendimento';

export type OperacaoFila = 'CRIAR' | 'ATUALIZAR' | 'EXCLUIR';

export interface ItemFila {
    id: number;
    entidade: EntidadeFila;
    operacao: OperacaoFila;
    entidadeId: string;
    payload: string | null;
    criadoEm: string;
    tentativas: number;
    erro: string | null;
}