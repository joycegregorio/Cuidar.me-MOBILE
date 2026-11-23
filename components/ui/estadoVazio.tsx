import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  icone: ComponentProps<typeof Ionicons>['name'];
  mensagem: string;
};

export default function EstadoVazio({ icone, mensagem }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icone} size={40} color="#9b8bc4" />
      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  mensagem: {
    fontSize: 15,
    color: '#7a5bc4',
    textAlign: 'center',
  },
});