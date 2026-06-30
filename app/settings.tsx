import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/hooks/useAuth';
import { useStore } from '../src/hooks/useStore';
import { getSupabase, uploadImage } from '../src/lib/supabase';
import { colors, spacing, radius } from '../src/utils/theme';

const DEFAULT_AVATAR = require('../assets/images/Default-Company-Logo.png');

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, updateProfile, changePassword } = useAuth();
  const { company, updateCompany } = useStore();

  const supabaseConfigured = !!getSupabase();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const [companyLogoLoading, setCompanyLogoLoading] = useState(false);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);

  const profilePicSource = (profilePicPreview || profile?.avatar_url)
    ? { uri: profilePicPreview || profile?.avatar_url! }
    : DEFAULT_AVATAR;

  const companyLogoSrc = (companyLogoPreview || company?.logo_url)
    ? { uri: companyLogoPreview || company?.logo_url! }
    : DEFAULT_AVATAR;

  async function handleChangePassword() {
    if (!supabaseConfigured) {
      Alert.alert('Offline', 'Not available offline — Supabase is not configured.');
      return;
    }
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handlePickProfilePic() {
    if (!supabaseConfigured) {
      Alert.alert('Offline', 'Not available offline — Supabase is not configured.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const localUri = result.assets[0].uri;
    setProfilePicPreview(localUri);
    setProfilePicLoading(true);
    try {
      const publicUrl = await uploadImage(localUri, 'user-profile');
      if (publicUrl) {
        await updateProfile({ avatar_url: publicUrl });
        setProfilePicPreview(publicUrl);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to upload image.');
    } finally {
      setProfilePicLoading(false);
    }
  }

  async function handlePickCompanyLogo() {
    if (!supabaseConfigured) {
      Alert.alert('Offline', 'Not available offline — Supabase is not configured.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const localUri = result.assets[0].uri;
    setCompanyLogoPreview(localUri);
    setCompanyLogoLoading(true);
    try {
      const publicUrl = await uploadImage(localUri, 'company-profile');
      if (publicUrl) {
        await updateCompany({ logo_url: publicUrl });
        setCompanyLogoPreview(publicUrl);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to upload image.');
    } finally {
      setCompanyLogoLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/marketplace')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.sectionTitle}>✦ Change Password</Text>

        <Text style={styles.label}>CURRENT PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor={colors.dim}
          secureTextEntry
        />

        <Text style={styles.label}>NEW PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor={colors.dim}
          secureTextEntry
        />

        <Pressable onPress={handleChangePassword} disabled={passwordLoading} style={[styles.primaryBtn, passwordLoading && styles.btnDisabled]}>
          {passwordLoading ? (
            <ActivityIndicator size="small" color={colors.obsidian} />
          ) : (
            <Text style={styles.primaryBtnText}>Update Password ✦</Text>
          )}
        </Pressable>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionTitle}>✦ Change Profile Picture</Text>

        <View style={styles.previewRow}>
          <Image source={profilePicSource} style={styles.previewImage} />
          <Pressable onPress={handlePickProfilePic} disabled={profilePicLoading} style={[styles.chooseBtn, profilePicLoading && styles.btnDisabled]}>
            {profilePicLoading ? (
              <ActivityIndicator size="small" color={colors.obsidian} />
            ) : (
              <Text style={styles.chooseBtnText}>Choose Photo</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.sectionDivider} />

        {company ? (
          <>
            <Text style={styles.sectionTitle}>✦ Change Company Logo</Text>

            <View style={styles.previewRow}>
              <Image source={companyLogoSrc} style={styles.previewImage} />
              <Pressable onPress={handlePickCompanyLogo} disabled={companyLogoLoading} style={[styles.chooseBtn, companyLogoLoading && styles.btnDisabled]}>
                {companyLogoLoading ? (
                  <ActivityIndicator size="small" color={colors.obsidian} />
                ) : (
                  <Text style={styles.chooseBtnText}>Choose Logo</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  backText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  title: { fontSize: 18, color: colors.white, fontFamily: 'serif', fontWeight: '700' },
  sectionTitle: { fontSize: 14, color: colors.gold, fontFamily: 'serif', fontWeight: '700', marginBottom: spacing.md },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: colors.gold, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.raised, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.white, borderWidth: 1, borderColor: colors.goldLine },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
  btnDisabled: { opacity: 0.5 },
  sectionDivider: { height: 1, backgroundColor: colors.goldLine, marginVertical: spacing.xl },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  previewImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface },
  chooseBtn: { backgroundColor: colors.gold, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  chooseBtnText: { fontSize: 13, fontWeight: '700', color: colors.obsidian },
});
