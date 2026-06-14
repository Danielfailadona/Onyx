import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../utils/theme';

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Field-level errors
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!fullName.trim())              e.fullName = 'Full name is required.';
    if (!email.trim())                 e.email    = 'Email is required.';
    else if (!email.includes('@'))     e.email    = 'Enter a valid email.';
    if (!password)                     e.password = 'Password is required.';
    else if (password.length < 6)      e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)          e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({
        email:    email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
      });
      Alert.alert(
        '✦ Account Created!',
        'Check your email to confirm your account, then sign in.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      Alert.alert('Sign Up Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Logo ── */}
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>✦</Text>
          </View>
          <Text style={styles.logoWord}>ONY<Text style={styles.logoAccent}>X</Text></Text>
          <Text style={styles.logoSub}>Food Marketplace</Text>
          <View style={styles.goldLine} />
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>New Account</Text>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardDesc}>Join Onyx to browse, order, and list your restaurant.</Text>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={[styles.inputWrap, errors.fullName && styles.inputError]}>
              <Text style={styles.inputIcon}>◉</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={v => { setFullName(v); setErrors(p => ({ ...p, fullName: null })); }}
                placeholder="Juan dela Cruz"
                placeholderTextColor={colors.dim}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName && <Text style={styles.errText}>{errors.fullName}</Text>}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <View style={[styles.inputWrap, errors.email && styles.inputError]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
                placeholder="you@email.com"
                placeholderTextColor={colors.dim}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
            {errors.email && <Text style={styles.errText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password *</Text>
            <View style={[styles.inputWrap, errors.password && styles.inputError]}>
              <Text style={styles.inputIcon}>⊙</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: null })); }}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.dim}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(p => !p)} style={styles.showPwBtn}>
                <Text style={styles.showPwText}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errText}>{errors.password}</Text>}
            {/* Password strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, {
                  width: `${Math.min(100, (password.length / 12) * 100)}%`,
                  backgroundColor: password.length < 6 ? colors.danger : password.length < 10 ? colors.gold : colors.success,
                }]} />
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={[styles.inputWrap, errors.confirm && styles.inputError]}>
              <Text style={styles.inputIcon}>⊙</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: null })); }}
                placeholder="Re-enter password"
                placeholderTextColor={colors.dim}
                secureTextEntry={!showPw}
              />
              {confirm.length > 0 && (
                <Text style={{ paddingHorizontal: spacing.md, fontSize: 16, color: confirm === password ? colors.success : colors.danger }}>
                  {confirm === password ? '✓' : '✕'}
                </Text>
              )}
            </View>
            {errors.confirm && <Text style={styles.errText}>{errors.confirm}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnGold, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.obsidian} />
              : <Text style={styles.btnGoldText}>Create Account  ✦</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={styles.btnOutlineText}>Sign In Instead</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        <Text style={styles.bottomTag}>Onyx ✦ Curated Dining</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.obsidian },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingVertical: spacing.xxl },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoMark: { width: 56, height: 56, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoMarkText: { color: colors.obsidian, fontSize: 24, fontWeight: '700' },
  logoWord: { color: colors.white, fontSize: 40, fontWeight: '800', letterSpacing: 8 },
  logoAccent: { color: colors.gold },
  logoSub: { color: colors.mid, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 },
  goldLine: { width: 48, height: 1, backgroundColor: colors.gold, opacity: 0.5, marginTop: spacing.lg },

  card: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.xl },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 },
  cardTitle: { color: colors.white, fontSize: 28, fontFamily: 'serif', marginBottom: 6 },
  cardDesc:  { color: colors.mid, fontSize: 13, lineHeight: 20, marginBottom: spacing.xl },

  field:     { marginBottom: spacing.lg },
  label:     { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(8,8,8,0.7)', borderWidth: 1, borderColor: colors.goldLine },
  inputError:{ borderColor: colors.danger },
  inputIcon: { color: colors.dim, fontSize: 14, paddingHorizontal: spacing.md },
  input:     { flex: 1, color: colors.white, fontSize: 15, fontFamily: 'serif', paddingVertical: 12, paddingRight: spacing.md },
  showPwBtn: { paddingHorizontal: spacing.md },
  showPwText:{ color: colors.mid, fontSize: 11 },
  errText:   { color: colors.danger, fontSize: 11, marginTop: 5 },

  strengthBar: { height: 3, backgroundColor: colors.surface, marginTop: 6, borderRadius: 2, overflow: 'hidden' },
  strengthFill:{ height: '100%', borderRadius: 2 },

  btnGold: { backgroundColor: colors.gold, paddingVertical: 15, alignItems: 'center', marginBottom: spacing.lg },
  btnGoldText: { color: colors.obsidian, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  btnOutline: { borderWidth: 1, borderColor: colors.goldLine, paddingVertical: 14, alignItems: 'center', marginBottom: spacing.lg },
  btnOutlineText: { color: colors.gold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.goldLine },
  dividerText: { color: colors.dim, fontSize: 10, textAlign: 'center' },

  terms: { color: colors.dim, fontSize: 11, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: colors.gold },

  bottomTag: { color: colors.dim, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', marginTop: spacing.xl },
});
