import ButtonPaciente, { type AbaPaciente } from '@/components/paciente/ButtonPaciente';
import EditarPacienteCard from '@/components/paciente/editarPacienteCard';
import PacienteForm from '@/components/paciente/pacienteForm';
import PacientesCadastradosCard from '@/components/paciente/pacientesCadastradosCard';
import type { Paciente } from '@/types/paciente';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function Pacientes() {
  const [abaAtiva, setAbaAtiva] = useState<AbaPaciente>('cadastrados');
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [versao, setVersao] = useState(0);

  const handleCadastrado = () => {
    setVersao((v) => v + 1);
    setAbaAtiva('cadastrados');
  };

  const handleEditado = () => {
    setVersao((v) => v + 1);
    setEditando(null);
  };

  return (
    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ButtonPaciente abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

      {abaAtiva === 'novo' && (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
