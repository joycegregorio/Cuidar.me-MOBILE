import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';

const logonome = require('../../assets/images/logonome.png');

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const abrir = (rota: '/sobrePage' | '/contatoPage') => {
    setMenuAberto(false);
    router.push(rota);
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await sair();
            router.replace('/loginPage');
          } catch (error) {
            console.error('Erro ao sair:', error);
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente!');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.cabecalho, { paddingTop: insets.top + 8 }]}>
      <Image
        source={logonome}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo Cuidar.me"
      />

      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuAberto(false)}
      > 
        <Pressable style={styles.fundoMenu} onPress={() => setMenuAberto(false)}>
          <View style={[styles.menu, {top: insets.top + 56}]}>
            <Pressable style={styles.itemMenu} onPress={() => abrir('/sobrePage')}>
              <Ionicons name='information-circle-outline' size={20} color="#5b00d2"/>
              <Text style={styles.textoMenu}>Sobre</Text>
            </Pressable>

            <Pressable style={styles.itemMenu} onPress={() => abrir('/contatoPage')}>
              <Ionicons name="mail-outline" size={20} color="#5b00d2" />
              <Text style={styles.textoMenu}>Contato</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.acoes}>
        <Pressable onPress={() => setMenuAberto(true)} hitSlop={8} accessibilityLabel='Mais informações'>
          <Ionicons name="information-circle-outline" size={24} color="#5b00d2" />
        </Pressable>

        <Pressable onPress={handleLogout} hitSlop={8} accessibilityLabel="Sair">
          <Ionicons name="log-out-outline" size={24} color="#5b00d2" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 40,
  },
  acoes: { flexDirection: 'row', 
    alignItems: 'center', 
    gap: 20,
  },
  fundoMenu: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
},
  menu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textoMenu: {
    fontSize: 16,
    color: '#5b00d2',
  },
});
