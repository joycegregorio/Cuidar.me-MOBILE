const pad = (num: number): string => num.toString().padStart(2, '0');

function formatar(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hojeISO(): string {
    return formatar(new Date());
}

export function somarDias(dataISO: string, dias: number): string {
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() + dias);
    return formatar(data);
}

export function juntarDataHorario(data: string, horario: string): string {
    return `${data}T${horario}:00`;
}

export function separarDataHorario(dataHora: string): { data: string; horario: string } {
    return { data: dataHora.slice(0, 10), horario: dataHora.slice(11, 16) };
}

export function formatarDiaMes(dataISO: string): string {
    const [, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}`;
}