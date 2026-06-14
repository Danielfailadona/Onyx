import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '../src/utils/theme';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.text}>This page does not exist.</Text>
      <Link href="/(tabs)/marketplace" style={styles.link}>Go to Marketplace</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian, alignItems: 'center', justifyContent: 'center', padding: 24 },
  code: { fontSize: 64, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  text: { fontSize: 16, color: colors.mid, marginBottom: 24 },
  link: { fontSize: 14, color: colors.gold, fontWeight: '600' },
});
