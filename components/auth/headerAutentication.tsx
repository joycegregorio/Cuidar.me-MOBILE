import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const logonome = require('../../assets/images/logonome.png');

const CORES_GRADIENTE = ['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00'] as const;

export default function HeaderAutentication() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.cabecalho, { paddingTop: insets.top + 8 }]}>
      <Image
        source={logonome}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo Cuidar.me"
      />

      <View style={styles.botoes}>
        <Pressable style={styles.botao} onPress={() => router.push('/sobrePage')}>
          <MaskedView maskElement={<Text style={styles.botaoTexto}>Sobre</Text>}>
            <LinearGradient
              colors={CORES_GRADIENTE}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.botaoTexto, { opacity: 0 }]}>Sobre</Text>
            </LinearGradient>
          </MaskedView>
        </Pressable>

        <Pressable style={styles.botao} onPress={() => router.push('/contatoPage')}>
          <MaskedView maskElement={<Text style={styles.botaoTexto}>Contato</Text>}>
            <LinearGradient
              colors={CORES_GRADIENTE}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.botaoTexto, { opacity: 0 }]}>Contato</Text>
            </LinearGradient>
          </MaskedView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 120,
    height: 40,
  },
  botoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, 
  },
  botao: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000', 
  },
});