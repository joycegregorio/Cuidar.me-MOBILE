import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const logonome = require('../../assets/images/logonome.png');

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('psicologo');
          router.replace('/loginPage');
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

      <View style={styles.acoes}>
        <Pressable onPress={() => router.push('/')} hitSlop={8} accessibilityLabel="Perfil">
          <FontAwesome5 name="user-friends" size={20} color="#5b00d2" />
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
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 20 },
});