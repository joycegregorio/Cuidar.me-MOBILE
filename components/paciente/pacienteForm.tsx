import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { pacienteRepository } from '@/database/pacienteRepository';
import type { Endereco, Paciente, PacienteForm as DadosPaciente } from '@/types/paciente';
import {
  cepValido,
  cpfCompleto,
  formatarDataBR,
  formatarDataISO,
  isoParaDate,
  mascaraCep,
  mascaraCpf,
  mascaraTelefone,
  telefoneValido,
  ufValida,
} from '@/utils/validacaoPaciente';

type Props = {
  paciente?: Paciente | null;
  onSalvo: () => void;
  onCancelar?: () => void;
};

const SEXOS = ['Feminino', 'Masculino', 'Outro'];
const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'];
const GRAUS_INSTRUCAO = ['Fundamental', 'Médio', 'Superior', 'Pós-graduação'];

const enderecoVazio: Endereco = { cep: '', logradouro: '', numero: '', cidade: '', estado: '' };

const formVazio: DadosPaciente = {
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  sexo: '',
  estadoCivil: '',
  grauInstrucao: '',
  profissao: '',
  telefone: '',
  enderecoPessoal: enderecoVazio,
  enderecoTrabalho: enderecoVazio,
  contatoEmergencia: { nome: '', telefone: '', parentesco: '' },
  infoAdicionais: '',
};

type Erros = Record<string, string>;

function validar(f: DadosPaciente, dataNasc: Date | null): Erros {
  const e: Erros = {};
  const obrigatorio = 'Campo obrigatório';

  if (!f.nome.trim()) e.nome = obrigatorio;
  if (!f.cpf) e.cpf = obrigatorio;
  else if (!cpfCompleto(f.cpf)) e.cpf = 'CPF incompleto (11 dígitos)';
  if (!f.rg.trim()) e.rg = obrigatorio;
  if (!dataNasc) e.dataNascimento = 'Selecione a data de nascimento';
  if (!f.sexo) e.sexo = 'Selecione o sexo';
  if (!f.estadoCivil) e.estadoCivil = 'Selecione o estado civil';
  if (!f.grauInstrucao) e.grauInstrucao = 'Selecione o grau de instrução';
  if (!f.profissao.trim()) e.profissao = obrigatorio;
  if (!f.telefone) e.telefone = obrigatorio;
  else if (!telefoneValido(f.telefone)) e.telefone = 'Telefone inválido';

  const p = f.enderecoPessoal;
  if (!p.cep) e['enderecoPessoal.cep'] = obrigatorio;
  else if (!cepValido(p.cep)) e['enderecoPessoal.cep'] = 'CEP inválido';
  if (!p.logradouro.trim()) e['enderecoPessoal.logradouro'] = obrigatorio;
  if (!p.cidade.trim()) e['enderecoPessoal.cidade'] = obrigatorio;
  if (!ufValida(p.estado)) e['enderecoPessoal.estado'] = 'Use a sigla (ex.: PB)';

  const t = f.enderecoTrabalho;
  if (t.cep && !cepValido(t.cep)) e['enderecoTrabalho.cep'] = 'CEP inválido';
  if (t.estado && !ufValida(t.estado)) e['enderecoTrabalho.estado'] = 'Use a sigla (ex.: PB)';
  if (f.contatoEmergencia.telefone && !telefoneValido(f.contatoEmergencia.telefone)) {
    e['contatoEmergencia.telefone'] = 'Telefone inválido';
  }
  return e;
}

const ROTULOS: Record<string, string> = {
  nome: 'Nome',
  cpf: 'CPF',
  rg: 'RG',
  dataNascimento: 'Data de nascimento',
  sexo: 'Sexo',
  estadoCivil: 'Estado civil',
  grauInstrucao: 'Grau de instrução',
  profissao: 'Profissão',
  telefone: 'Telefone',
  'enderecoPessoal.cep': 'CEP (endereço pessoal)',
  'enderecoPessoal.logradouro': 'Logradouro (endereço pessoal)',
  'enderecoPessoal.cidade': 'Cidade (endereço pessoal)',
  'enderecoPessoal.estado': 'UF (endereço pessoal)',
  'enderecoTrabalho.cep': 'CEP (endereço de trabalho)',
  'enderecoTrabalho.estado': 'UF (endereço de trabalho)',
  'contatoEmergencia.telefone': 'Telefone (contato de emergência)',
};

type CampoProps = TextInputProps & { rotulo: string; obrigatorio?: boolean; erro?: string };

function Campo({ rotulo, obrigatorio, erro, style, ...rest }: CampoProps) {
  return (
    <View>
      <Text style={styles.label}>
        {rotulo}
        {obrigatorio ? ' *' : ''}
      </Text>
      <TextInput
        style={[styles.input, erro ? styles.inputErro : null, style]}
        placeholderTextColor="#999"
        {...rest}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

type SelecaoProps = {
  rotulo: string;
  placeholder: string;
  opcoes: string[];
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
};

function Selecao({ rotulo, placeholder, opcoes, valor, onChange, erro }: SelecaoProps) {
  return (
    <View>
      <Text style={styles.label}>{rotulo} *</Text>
      <View style={[styles.pickerBox, erro ? styles.inputErro : null]}>
        <Picker selectedValue={valor} onValueChange={(v) => onChange(String(v))}>
          <Picker.Item label={placeholder} value="" />
          {opcoes.map((o) => (
            <Picker.Item key={o} label={o} value={o} />
          ))}
        </Picker>
      </View>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

export default function PacienteForm({ paciente, onSalvo, onCancelar }: Props) {
  const db = useSQLiteContext();
  const editando = !!paciente;

  const [form, setForm] = useState<DadosPaciente>(() => {
    if (!paciente) return formVazio;
    const { id: _id, criadoEm: _criadoEm, ...dados } = paciente;
    return dados;
  });
  const [dataNasc, setDataNasc] = useState<Date | null>(() =>
    paciente ? isoParaDate(paciente.dataNascimento) : null,
  );
  const [mostrarData, setMostrarData] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const limparErro = (chave: string) => setErros((atual) => ({ ...atual, [chave]: '' }));

  const alterar = <K extends keyof DadosPaciente>(campo: K, valor: DadosPaciente[K]) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    limparErro(campo);
  };

  const alterarEndereco = (tipo: 'enderecoPessoal' | 'enderecoTrabalho', campo: keyof Endereco, valor: string) => {
    setForm((atual) => ({ ...atual, [tipo]: { ...atual[tipo], [campo]: valor } }));
    limparErro(`${tipo}.${campo}`);
  };

  const alterarContato = (campo: keyof DadosPaciente['contatoEmergencia'], valor: string) => {
    setForm((atual) => ({ ...atual, contatoEmergencia: { ...atual.contatoEmergencia, [campo]: valor } }));
    limparErro(`contatoEmergencia.${campo}`);
  };

  const salvar = async () => {
    const novosErros = validar(form, dataNasc);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0 || !dataNasc) {
      const problemas = Object.entries(novosErros).map(
        ([campo, mensagem]) => `• ${ROTULOS[campo] ?? campo}: ${mensagem}`
      );
      Alert.alert('Corrija os campos', problemas.join('\n'));
      return;
    }

    setSalvando(true);
    try {
      if (await pacienteRepository.cpfJaCadastrado(db, form.cpf, paciente?.id)) {
        setErros({ cpf: 'Já existe um paciente com este CPF' });
        Alert.alert('Atenção', 'Já existe um paciente cadastrado com este CPF.');
        return;
      }

      const dados: DadosPaciente = {
        ...form,
        nome: form.nome.trim(),
        dataNascimento: formatarDataISO(dataNasc),
        enderecoPessoal: { ...form.enderecoPessoal, estado: form.enderecoPessoal.estado.toUpperCase() },
        enderecoTrabalho: { ...form.enderecoTrabalho, estado: form.enderecoTrabalho.estado.toUpperCase() },
      };

      if (paciente) await pacienteRepository.atualizar(db, paciente.id, dados);
      else await pacienteRepository.inserir(db, dados);

      if (!paciente) {
        setForm(formVazio);
        setDataNasc(null);
      }
      Alert.alert('Sucesso', editando ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!');
      onSalvo();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      Alert.alert('Erro', 'Não foi possível salvar o paciente. Tente novamente!');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View>
      <Text style={styles.title}>{editando ? 'Editar Paciente' : 'Cadastro de Paciente'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados pessoais</Text>

        <Campo rotulo="Nome completo" obrigatorio value={form.nome} erro={erros.nome}
          onChangeText={(v) => alterar('nome', v)} autoCapitalize="words" />
        <Campo rotulo="CPF" obrigatorio value={form.cpf} erro={erros.cpf} keyboardType="numeric"
          placeholder="000.000.000-00" onChangeText={(v) => alterar('cpf', mascaraCpf(v))} />
        <Campo rotulo="RG" obrigatorio value={form.rg} erro={erros.rg} onChangeText={(v) => alterar('rg', v)} />

        <Text style={styles.label}>Data de nascimento *</Text>
        <Pressable
          style={[styles.inputBusca, erros.dataNascimento ? styles.inputErro : null]}
          onPress={() => setMostrarData(true)}
        >
          <Ionicons name="calendar" size={18} color="#666" />
          <Text style={styles.dataTexto}>{dataNasc ? formatarDataBR(dataNasc) : 'Selecione a data'}</Text>
        </Pressable>
        {erros.dataNascimento ? <Text style={styles.erro}>{erros.dataNascimento}</Text> : null}
        {mostrarData && (
          <DateTimePicker
            value={dataNasc ?? new Date(2000, 0, 1)}
            mode="date"
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(event, escolhida) => {
              setMostrarData(false);
              if (event.type === 'set' && escolhida) {
                setDataNasc(escolhida);
                limparErro('dataNascimento');
              }
            }}
          />
        )}

        <Selecao rotulo="Sexo" placeholder="Selecione o sexo" opcoes={SEXOS} valor={form.sexo}
          erro={erros.sexo} onChange={(v) => alterar('sexo', v)} />
        <Selecao rotulo="Estado civil" placeholder="Selecione o estado civil" opcoes={ESTADOS_CIVIS}
          valor={form.estadoCivil} erro={erros.estadoCivil} onChange={(v) => alterar('estadoCivil', v)} />
        <Selecao rotulo="Grau de instrução" placeholder="Selecione o grau de instrução" opcoes={GRAUS_INSTRUCAO}
          valor={form.grauInstrucao} erro={erros.grauInstrucao} onChange={(v) => alterar('grauInstrucao', v)} />

        <Campo rotulo="Profissão" obrigatorio value={form.profissao} erro={erros.profissao}
          onChangeText={(v) => alterar('profissao', v)} />
        <Campo rotulo="Telefone" obrigatorio value={form.telefone} erro={erros.telefone} keyboardType="phone-pad"
          placeholder="(00) 00000-0000" onChangeText={(v) => alterar('telefone', mascaraTelefone(v))} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço pessoal</Text>
        <Campo rotulo="CEP" obrigatorio value={form.enderecoPessoal.cep} erro={erros['enderecoPessoal.cep']}
          keyboardType="numeric" placeholder="00000-000"
          onChangeText={(v) => alterarEndereco('enderecoPessoal', 'cep', mascaraCep(v))} />
        <Campo rotulo="Logradouro" obrigatorio value={form.enderecoPessoal.logradouro}
          erro={erros['enderecoPessoal.logradouro']}
          onChangeText={(v) => alterarEndereco('enderecoPessoal', 'logradouro', v)} />
        <Campo rotulo="Número" value={form.enderecoPessoal.numero}
          onChangeText={(v) => alterarEndereco('enderecoPessoal', 'numero', v)} />
        <Campo rotulo="Cidade" obrigatorio value={form.enderecoPessoal.cidade}
          erro={erros['enderecoPessoal.cidade']}
          onChangeText={(v) => alterarEndereco('enderecoPessoal', 'cidade', v)} />
        <Campo rotulo="Estado (UF)" obrigatorio value={form.enderecoPessoal.estado}
          erro={erros['enderecoPessoal.estado']} maxLength={2} autoCapitalize="characters"
          onChangeText={(v) => alterarEndereco('enderecoPessoal', 'estado', v.toUpperCase())} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Endereço de trabalho (opcional)</Text>
        <Campo rotulo="CEP" value={form.enderecoTrabalho.cep} erro={erros['enderecoTrabalho.cep']}
          keyboardType="numeric" placeholder="00000-000"
          onChangeText={(v) => alterarEndereco('enderecoTrabalho', 'cep', mascaraCep(v))} />
        <Campo rotulo="Logradouro" value={form.enderecoTrabalho.logradouro}
          onChangeText={(v) => alterarEndereco('enderecoTrabalho', 'logradouro', v)} />
        <Campo rotulo="Número" value={form.enderecoTrabalho.numero}
          onChangeText={(v) => alterarEndereco('enderecoTrabalho', 'numero', v)} />
        <Campo rotulo="Cidade" value={form.enderecoTrabalho.cidade}
          onChangeText={(v) => alterarEndereco('enderecoTrabalho', 'cidade', v)} />
        <Campo rotulo="Estado (UF)" value={form.enderecoTrabalho.estado}
          erro={erros['enderecoTrabalho.estado']} maxLength={2} autoCapitalize="characters"
          onChangeText={(v) => alterarEndereco('enderecoTrabalho', 'estado', v.toUpperCase())} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contato de emergência (opcional)</Text>
        <Campo rotulo="Nome" value={form.contatoEmergencia.nome} autoCapitalize="words"
          onChangeText={(v) => alterarContato('nome', v)} />
        <Campo rotulo="Telefone" value={form.contatoEmergencia.telefone}
          erro={erros['contatoEmergencia.telefone']} keyboardType="phone-pad" placeholder="(00) 00000-0000"
          onChangeText={(v) => alterarContato('telefone', mascaraTelefone(v))} />
        <Campo rotulo="Parentesco" value={form.contatoEmergencia.parentesco}
          onChangeText={(v) => alterarContato('parentesco', v)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observações</Text>
        <Campo rotulo="Informações adicionais" value={form.infoAdicionais} multiline
          style={styles.multilinha} onChangeText={(v) => alterar('infoAdicionais', v)} />
      </View>

      <View style={styles.acoes}>
        <Pressable
          style={[styles.botao, styles.botaoPrimario, salvando && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>{editando ? 'Salvar alterações' : 'Cadastrar Paciente'}</Text>
          )}
        </Pressable>
        {onCancelar ? (
          <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={onCancelar} disabled={salvando}>
            <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#a755f7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  multilinha: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  inputErro: {
    borderColor: '#dc2626',
  },
  erro: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
  inputBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    gap: 8,
  },
  dataTexto: {
    flex: 1,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  acoes: {
    gap: 8,
  },
  botao: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoPrimario: {
    backgroundColor: '#a755f7',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoPrimarioTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#a755f7',
  },
  botaoSecundarioTexto: {
    color: '#a755f7',
    fontWeight: '600',
    fontSize: 16,
  },
});
