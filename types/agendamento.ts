export type StatusAgendamento = 
| 'PENDENTE' 
| 'CONFIRMADO' 
| 'CANCELADO' 
| 'REALIZADO' 
| 'REMARCADO';

export interface AgendamentoForm {
  pacienteId: number;
  data: string;
  localidade: string;
  status: StatusAgendamento;
}

export interface Agendamento extends AgendamentoForm {
  id: number;
  criadoEm: string;
}

export interface AgendamentoComPaciente extends Agendamento {
  paciente: {
    id: number;
    nome: string;
  };
}