import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, radius } from '../../src/utils/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleLogin() {
    setSubmitError('');
    if (!email.trim()) { setSubmitError('Please enter your email.'); return; }
    if (!email.includes('@')) { setSubmitError('Please enter a valid email.'); return; }
    if (!password) { setSubmitError('Please enter your password.'); return; }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/marketplace');
    } catch (err: any) {
      const msg = err?.message ?? '';
      console.error('SignIn error:', msg);
      if (msg.includes('Invalid login credentials')) {
        setSubmitError('Incorrect email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setSubmitError('Please check your inbox and confirm your email before signing in.');
      } else if (msg.includes('rate limit')) {
        setSubmitError('Too many attempts. Please wait a moment before trying again.');
      } else if (msg.includes('Supabase is not configured')) {
        setSubmitError('Supabase is not configured. Add your credentials to the .env file.');
      } else {
        setSubmitError(msg || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.mark}>✦</Text>
          <Text style={styles.brand}>ONYX</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {submitError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => { setEmail(t); setSubmitError(''); }}
            placeholder="your@email.com"
            placeholderTextColor={colors.dim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={t => { setPassword(t); setSubmitError(''); }}
              placeholder="Enter password"
              placeholderTextColor={colors.dim}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleLogin} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
            <Text style={styles.primaryBtnText}>{loading ? 'Signing In...' : 'Sign In ✦'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Create an Account</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  mark: { fontSize: 36, color: colors.gold, marginBottom: spacing.xs },
  brand: { fontSize: 28, color: colors.white, fontFamily: 'serif', letterSpacing: 8, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.goldLine },
  title: { fontSize: 22, color: colors.white, fontFamily: 'serif', fontWeight: '600', marginBottom: spacing.xs },
  subtitle: { fontSize: 13, color: colors.mid, marginBottom: spacing.lg },
  errorBox: { backgroundColor: 'rgba(184,64,64,0.12)', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, marginBottom: spacing.md },
  errorBoxText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: colors.gold, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.raised, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.white, borderWidth: 1, borderColor: colors.goldLine },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyeBtn: { padding: spacing.sm },
  eyeText: { fontSize: 20 },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
  btnDisabled: { opacity: 0.5 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  footer: { fontSize: 10, color: colors.dim, textAlign: 'center', marginTop: spacing.lg, lineHeight: 16 },
});
