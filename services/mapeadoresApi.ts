import type { Agendamento } from '@/types/agendamento';
import type { PacienteForm } from '@/types/paciente';
import { juntarDataHorario } from '@/utils/data';

export function pacienteParaApi(id: string, p: PacienteForm) {
  return {
    lookupId: id,
    nome: p.nome,
    cpf: p.cpf,
    rg: p.rg,
    dataNascimento: p.dataNascimento,
    sexo: p.sexo,
    estadoCivil: p.estadoCivil,
    grauInstrucao: p.grauInstrucao,
    profissao: p.profissao,
    telefone: p.telefone,
    enderecoPessoal: p.enderecoPessoal,
    enderecoTrabalho: p.enderecoTrabalho,
    contatoEmergencia: p.contatoEmergencia,
    infoAdicionais: p.infoAdicionais,
  };
}

export function agendamentoParaApi(a: Pick<Agendamento, 'id' | 'data' | 'horario' | 'localidade' | 'status'>) {
  return {
    lookupId: a.id,
    data: juntarDataHorario(a.data, a.horario),
    localidade: a.localidade,
    status: a.status,
  };
}
