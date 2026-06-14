import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors } from '../src/utils/theme';

export default function Index() {
  const { session, authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>ONYX</Text>
        <ActivityIndicator size="small" color={colors.gold} />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)/marketplace' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.obsidian, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logo: { fontSize: 32, color: colors.gold, fontFamily: 'serif', letterSpacing: 6, fontWeight: '700' },
});
