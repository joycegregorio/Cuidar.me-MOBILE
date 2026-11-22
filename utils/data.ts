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

export function formatarDiaMes(dataISO: string): string {
    const [, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}`;
}