import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { usePanel } from '../hooks/usePanel';
import { colors, spacing, radius } from '../utils/theme';

const PANEL_WIDTH = 280;

export default function ProfilePanel() {
  const router = useRouter();
  const { open, setOpen } = usePanel();
  const { user, profile, signOut, updateProfile } = useAuth();
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: open ? 0 : -PANEL_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: open ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    if (open && profile) {
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [open, slideAnim, fadeAnim, profile]);

  function handleClose() {
    setOpen(false);
    setShowProfileForm(false);
  }

  async function handleLogout() {
    handleClose();
    await signOut();
    router.replace('/(auth)/login');
  }

  async function handleSaveProfile() {
    await updateProfile({ phone: phone.trim() || null, address: address.trim() || null });
    setShowProfileForm(false);
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '?';

  const displayName = profile?.full_name || 'User';
  const displayEmail = user?.email || profile?.email || 'No email';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>

        <View style={styles.divider} />

        <Pressable onPress={() => setShowProfileForm(!showProfileForm)} style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>👤</Text>
          <Text style={styles.menuItemText}>My Profile</Text>
          <Text style={styles.chevron}>{showProfileForm ? '▲' : '▼'}</Text>
        </Pressable>

        {showProfileForm && (
          <View style={styles.profileForm}>
            <Text style={styles.label}>PHONE</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={colors.dim}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>ADDRESS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor={colors.dim}
              multiline
              numberOfLines={3}
            />
            <Pressable onPress={handleSaveProfile} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.divider} />

        <Pressable onPress={handleLogout} style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>🚪</Text>
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: colors.charcoal,
    borderRightWidth: 1,
    borderRightColor: colors.goldLine,
    paddingTop: 56,
    zIndex: 10,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    paddingRight: spacing.lg,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.mid,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.obsidian,
    letterSpacing: 1,
  },
  name: {
    fontSize: 18,
    color: colors.white,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  email: {
    fontSize: 12,
    color: colors.mid,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.goldLine,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: colors.mid,
  },
  logoutText: {
    color: colors.danger,
  },
  profileForm: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.gold,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.raised,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.obsidian,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
