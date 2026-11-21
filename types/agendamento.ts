export type StatusAgendamento = 
| 'PENDENTE' 
| 'CONFIRMADO' 
| 'CANCELADO' 
| 'REALIZADO' 
| 'REMARCADO';

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