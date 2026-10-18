import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import PacienteForm from '@/components/paciente/pacienteForm';
import type { Paciente } from '@/types/paciente';

type Props = {
  paciente: Paciente | null;
  onSalvo: () => void;
  onCancelar: () => void;
};

export default function EditarPacienteCard({ paciente, onSalvo, onCancelar }: Props) {
  return (
    <Modal visible={paciente !== null} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={styles.fundo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.caixa}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
            {paciente && (
              <PacienteForm
                key={paciente.id}
                paciente={paciente}
                onSalvo={onSalvo}
                onCancelar={onCancelar}
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  caixa: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '92%',
  },
  conteudo: {
    padding: 16,
  },
});
