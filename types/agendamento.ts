export type StatusAgendamento =
| 'AGENDADO'
| 'CONCLUIDO'
| 'CANCELADO'
| 'REMARCADO';

export const STATUS_TEXTO: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendada',
  CONCLUIDO: 'Concluída',
  CANCELADO: 'Cancelada',
  REMARCADO: 'Remarcada',
};

export interface AgendamentoForm {
  pacienteId: string;
  data: string;
  horario: string;
  localidade: string;
  status: StatusAgendamento;
}

export interface Agendamento extends AgendamentoForm {
  id: string;
  criadoEm: string;
}

export interface AgendamentoComPaciente extends Agendamento {
  paciente: {
    id: string;
    nome: string;
  };
}