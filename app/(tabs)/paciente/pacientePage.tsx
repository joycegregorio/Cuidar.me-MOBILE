import EditarPacienteCard from '@/components/paciente/editarPacienteCard';
import PacienteForm from '@/components/paciente/pacienteForm';
import PacientesCadastradosCard from '@/components/paciente/pacientesCadastradosCard';
import AbasSegmentadas, { Aba } from '@/components/ui/abasSegmentadas';
import FundoGradiente from '@/components/ui/fundoGradiente';
import type { Paciente } from '@/types/paciente';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AbaPaciente = 'novo' | 'cadastrados'
export default function Pacientes() {
  const insets = useSafeAreaInsets();
  const [abaAtiva, setAbaAtiva] = useState<AbaPaciente>('cadastrados');
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [versao, setVersao] = useState(0);

  const offSetTeclado = insets.top + 72;

  const handleCadastrado = () => {
    setVersao((v) => v + 1);
    setAbaAtiva('cadastrados');
  };

  const handleEditado = () => {
    setVersao((v) => v + 1);
    setEditando(null);
  };

  const ABAS:  Aba<AbaPaciente>[] = [
    { valor: 'novo', rotulo: 'Novo Paciente', icone: 'person-add-outline'},
    { valor: 'cadastrados', rotulo: 'Pacientes Cadastrados', icone: 'people-outline'},
  ];

  return (
    <FundoGradiente style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={offSetTeclado}
      >
        <AbasSegmentadas abas={ABAS} abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

        {abaAtiva === 'novo' && (
          <ScrollView 
          keyboardShouldPersistTaps="handled" 
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
              <PacienteForm onSalvo={handleCadastrado} />
            </View>
          </ScrollView>
        )}

        {abaAtiva === 'cadastrados' && (
          <PacientesCadastradosCard key={versao} onEditar={setEditando} />
        )}

        <EditarPacienteCard
          paciente={editando}
          onSalvo={handleEditado}
          onCancelar={() => setEditando(null)}
        />
      </KeyboardAvoidingView>  
    </FundoGradiente>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
});
