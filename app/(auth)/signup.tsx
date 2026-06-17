import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, radius } from '../../src/utils/theme';

const KeyboardContainer = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@')) e.email = 'Invalid email format.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'At least 6 characters.';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setFieldErrors(e);
    setSubmitError('');
    return Object.keys(e).length === 0;
  }

  async function handleSignup() {
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      router.replace('/(auth)/login');
    } catch (err: any) {
      const msg = err?.message ?? '';
      console.error('SignUp error:', msg);
      if (msg.includes('already registered')) {
        setSubmitError('An account with this email already exists. Try signing in instead.');
      } else if (msg.includes('weak password') || msg.includes('Password should be')) {
        setSubmitError('Please use a stronger password (at least 6 characters with mixed characters).');
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

  const strength = password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong';
  const strengthColor = strength === 'weak' ? colors.danger : strength === 'medium' ? colors.gold : colors.success;

  return (
    <KeyboardContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.mark}>✦</Text>
          <Text style={styles.brand}>ONYX</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Join ONYX</Text>
          <Text style={styles.subtitle}>Create your marketplace account</Text>

          {submitError ? (
            <View style={styles.submitErrorBox}>
              <Text style={styles.submitErrorText}>{submitError}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={[styles.input, fieldErrors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={t => { setFullName(t); setFieldErrors(p => ({ ...p, fullName: '' })); setSubmitError(''); }}
            placeholder="John Doe"
            placeholderTextColor={colors.dim}
            autoCapitalize="words"
          />
          {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[styles.input, fieldErrors.email && styles.inputError]}
            value={email}
            onChangeText={t => { setEmail(t); setFieldErrors(p => ({ ...p, email: '' })); setSubmitError(''); }}
            placeholder="your@email.com"
            placeholderTextColor={colors.dim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={[styles.input, fieldErrors.password && styles.inputError]}
            value={password}
            onChangeText={t => { setPassword(t); setFieldErrors(p => ({ ...p, password: '' })); setSubmitError(''); }}
            placeholder="Minimum 6 characters"
            placeholderTextColor={colors.dim}
            secureTextEntry
            autoCapitalize="none"
          />
          {password ? (
            <View style={styles.strengthBar}>
              <View style={[styles.strengthFill, { width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%', backgroundColor: strengthColor }]} />
            </View>
          ) : null}
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <View style={styles.confirmRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, fieldErrors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={t => { setConfirmPassword(t); setFieldErrors(p => ({ ...p, confirmPassword: '' })); setSubmitError(''); }}
              placeholder="Re-enter password"
              placeholderTextColor={colors.dim}
              secureTextEntry
              autoCapitalize="none"
            />
            {confirmPassword ? (
              <Text style={{ fontSize: 18, marginLeft: spacing.sm }}>{password === confirmPassword ? '✅' : '❌'}</Text>
            ) : null}
          </View>
          {fieldErrors.confirmPassword ? <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text> : null}

          <Pressable onPress={handleSignup} disabled={loading} style={[styles.primaryBtn, loading && styles.btnDisabled]}>
            <Text style={styles.primaryBtnText}>{loading ? 'Creating Account...' : 'Create Account ✦'}</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/login')} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Sign In Instead</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardContainer>
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
  submitErrorBox: { backgroundColor: 'rgba(184,64,64,0.12)', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, marginBottom: spacing.md },
  submitErrorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: colors.gold, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.raised, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.white, borderWidth: 1, borderColor: colors.goldLine },
  inputError: { borderColor: colors.danger },
  fieldError: { fontSize: 11, color: colors.danger, marginTop: spacing.xs },
  strengthBar: { height: 3, backgroundColor: colors.raised, borderRadius: radius.full, marginTop: spacing.sm, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: radius.full },
  confirmRow: { flexDirection: 'row', alignItems: 'center' },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
  btnDisabled: { opacity: 0.5 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
});
