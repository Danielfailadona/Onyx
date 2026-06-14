import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin() {
    const trimEmail = email.trim().toLowerCase();
    const trimPw    = password.trim();

    if (!trimEmail || !trimPw) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    if (!trimEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: trimEmail, password: trimPw });
      // Navigation handled by App.js via auth state
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Invalid email or password. Please try again.');
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

        {/* ── Logo / Hero ── */}
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
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardDesc}>Enter your credentials to access the marketplace.</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={colors.dim}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>⊙</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.dim}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(p => !p)} style={styles.showPwBtn}>
                <Text style={styles.showPwText}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnGold, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.obsidian} />
              : <Text style={styles.btnGoldText}>Sign In  ✦</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Go to register */}
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.85}>
            <Text style={styles.btnOutlineText}>Create an Account</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* ── Bottom tag ── */}
        <Text style={styles.bottomTag}>Onyx ✦ Curated Dining</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.obsidian },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingVertical: spacing.xxl },

  // Hero
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoMark: {
    width: 56, height: 56,
    backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoMarkText: { color: colors.obsidian, fontSize: 24, fontWeight: '700' },
  logoWord: { color: colors.white, fontSize: 40, fontWeight: '800', letterSpacing: 8 },
  logoAccent: { color: colors.gold },
  logoSub: {
    color: colors.mid, fontSize: 11,
    letterSpacing: 4, textTransform: 'uppercase', marginTop: 4,
  },
  goldLine: { width: 48, height: 1, backgroundColor: colors.gold, opacity: 0.5, marginTop: spacing.lg },

  // Card
  card: {
    backgroundColor: colors.charcoal,
    borderWidth: 1, borderColor: colors.goldLine,
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.gold, fontSize: 9, fontWeight: '700',
    letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6,
  },
  cardTitle: { color: colors.white, fontSize: 28, fontFamily: 'serif', marginBottom: 6 },
  cardDesc:  { color: colors.mid, fontSize: 13, lineHeight: 20, marginBottom: spacing.xl },

  // Fields
  field:     { marginBottom: spacing.lg },
  label:     { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.sm },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(8,8,8,0.7)', borderWidth: 1, borderColor: colors.goldLine },
  inputIcon: { color: colors.dim, fontSize: 14, paddingHorizontal: spacing.md },
  input:     { flex: 1, color: colors.white, fontSize: 15, fontFamily: 'serif', paddingVertical: 12, paddingRight: spacing.md },
  showPwBtn: { paddingHorizontal: spacing.md },
  showPwText:{ color: colors.mid, fontSize: 11 },

  // Buttons
  btnGold: { backgroundColor: colors.gold, paddingVertical: 15, alignItems: 'center', marginBottom: spacing.lg },
  btnGoldText: { color: colors.obsidian, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  btnOutline: { borderWidth: 1, borderColor: colors.goldLine, paddingVertical: 14, alignItems: 'center', marginBottom: spacing.lg },
  btnOutlineText: { color: colors.gold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.goldLine },
  dividerText: { color: colors.dim, fontSize: 11 },

  // Terms
  terms: { color: colors.dim, fontSize: 11, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: colors.gold },

  // Bottom
  bottomTag: { color: colors.dim, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', marginTop: spacing.xl },
});
