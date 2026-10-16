import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function Pacientes() {
  return (
    <LinearGradient
      colors={['#1f1f8b', '#A259FF', '#F76FFF', '#FF8A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Pacientes</Text>
        </View>

    </LinearGradient>    
  );
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
  },
});    