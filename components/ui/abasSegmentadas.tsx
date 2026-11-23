import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROXO } from '@/constants/cores';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

export type Aba<T extends string> = {
  valor: T;
  rotulo: string;
  icone: NomeIcone;
};

type Props<T extends string> = {
  abas: Aba<T>[];
  abaAtiva: T;
  onMudarAba: (aba: T) => void;
};

export default function AbasSegmentadas<T extends string>({ abas, abaAtiva, onMudarAba }: Props<T>) {
  return (
    <View style={styles.container}>
      {abas.map((aba) => {
        const ativa = aba.valor === abaAtiva;
        return (
          <Pressable
            key={aba.valor}
            style={[styles.botao, ativa && styles.botaoAtivo]}
            onPress={() => onMudarAba(aba.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
          >
            <Ionicons name={aba.icone} size={20} color={ativa ? '#FFFFFF' : ROXO} />
            <Text
              style={[styles.textoBotao, ativa && styles.textoBotaoAtivo]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {aba.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#FFFFFF55',
  },
  botao: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  botaoAtivo: {
    backgroundColor: ROXO,
  },
  textoBotao: {
    fontSize: 12,
    color: ROXO,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  textoBotaoAtivo: {
    color: '#FFFFFF',
  },
});