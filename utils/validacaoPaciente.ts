const soDigitos = (valor: string) => valor.replace(/\D/g, '');

function aplicarMascara(valor: string, padrao: string) {
  const digitos = soDigitos(valor);
  let saida = '';
  let i = 0;
  for (const c of padrao) {
    if (i >= digitos.length) break;
    saida += c === '#' ? digitos[i++] : c;
  }
  return saida;
}

export const mascaraCpf = (v: string) => aplicarMascara(v, '###.###.###-##');
export const mascaraCep = (v: string) => aplicarMascara(v, '#####-###');
export const mascaraTelefone = (v: string) =>
  aplicarMascara(v, soDigitos(v).length > 10 ? '(##) #####-####' : '(##) ####-####');

export const cpfCompleto = (cpf: string) => soDigitos(cpf).length === 11;

export const telefoneValido = (tel: string) => [10, 11].includes(soDigitos(tel).length);
export const cepValido = (cep: string) => soDigitos(cep).length === 8;
export const ufValida = (uf: string) => /^[A-Za-z]{2}$/.test(uf);

const pad = (n: number) => String(n).padStart(2, '0');

export const formatarDataISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const formatarDataBR = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export function isoParaDate(iso: string) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function calcularIdade(iso: string) {
  const nasc = isoParaDate(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
  return idade;
}
