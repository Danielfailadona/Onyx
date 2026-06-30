import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { usePanel } from '../hooks/usePanel';
import { colors, spacing } from '../utils/theme';

const PANEL_WIDTH = 280;
const DEFAULT_AVATAR = require('../../assets/images/Default-Company-Logo.png');

export default function ProfilePanel() {
  const router = useRouter();
  const { open, setOpen } = usePanel();
  const { user, profile, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [avatarError, setAvatarError] = useState(false);

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
  }, [open, slideAnim, fadeAnim]);

  function handleClose() {
    setOpen(false);
  }

  async function handleLogout() {
    handleClose();
    await signOut();
    router.replace('/(auth)/login');
  }

  const displayName = profile?.full_name || 'User';
  const displayEmail = user?.email || profile?.email || 'No email';

  const avatarSource = profile?.avatar_url && !avatarError
    ? { uri: profile.avatar_url }
    : DEFAULT_AVATAR;

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
          <Image source={avatarSource} onError={() => setAvatarError(true)} style={styles.avatar} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>

        <View style={styles.divider} />

        <Pressable onPress={() => { handleClose(); router.push('/edit-address'); }} style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>👤</Text>
          <Text style={styles.menuItemText}>My Profile</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable onPress={() => { handleClose(); router.push('/settings'); }} style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>⚙</Text>
          <Text style={styles.menuItemText}>Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

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
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
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

});
