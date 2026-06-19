import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../src/hooks/useAuth';
import { colors, spacing, radius } from '../src/utils/theme';

export default function EditAddressScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();

  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude ?? null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [saving, setSaving] = useState(false);
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (profile && !dataLoaded.current) {
      dataLoaded.current = true;
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
      setLatitude(profile.latitude ?? null);
      setLongitude(profile.longitude ?? null);
    }
  }, [profile]);

  async function getLocationWithPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGeoError('Location permission denied. Enable it in Settings to use this feature.');
      return null;
    }
    return Location.getCurrentPositionAsync({});
  }

  async function handleAutoFillAddress() {
    setGeoError('');
    setGeoLoading(true);
    try {
      const location = await getLocationWithPermission();
      if (!location) return;
      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat);
      setLongitude(lng);
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (addresses.length > 0) {
        const a = addresses[0];
        const parts = [a.street, a.district, a.city, a.region, a.postalCode, a.country].filter(Boolean);
        setAddress(parts.join(', '));
      } else {
        setGeoError('GPS location found but could not reverse-geocode to an address.');
      }
    } catch {
      setGeoError('Failed to auto-fill address. Check your GPS and internet connection.');
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleSave() {
    setGeoError('');
    setSaving(true);
    try {
      await updateProfile({
        phone: phone.trim() || null,
        address: address.trim() || null,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      } as any);
      router.replace('/(tabs)/marketplace');
    } catch (e: any) {
      setGeoError(e?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/marketplace')}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
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
          placeholder="Enter your full address"
          placeholderTextColor={colors.dim}
          multiline
          numberOfLines={3}
        />

        <Pressable onPress={handleAutoFillAddress} disabled={geoLoading} style={[styles.autoBtn, geoLoading && styles.btnDisabled]}>
          {geoLoading ? (
            <ActivityIndicator size="small" color={colors.obsidian} />
          ) : (
            <Text style={styles.autoBtnText}>📍 Auto-Fill Address from GPS</Text>
          )}
        </Pressable>

        <Text style={styles.label}>LATITUDE</Text>
        <TextInput
          style={styles.input}
          value={latitude !== null ? latitude.toString() : ''}
          onChangeText={t => setLatitude(t ? parseFloat(t) : null)}
          placeholder="Tap 'Get My Location' or type here"
          placeholderTextColor={colors.dim}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>LONGITUDE</Text>
        <TextInput
          style={styles.input}
          value={longitude !== null ? longitude.toString() : ''}
          onChangeText={t => setLongitude(t ? parseFloat(t) : null)}
          placeholder="Tap 'Get My Location' or type here"
          placeholderTextColor={colors.dim}
          keyboardType="decimal-pad"
        />

        {geoError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{geoError}</Text>
          </View>
        ) : null}

        <Pressable onPress={handleSave} disabled={saving} style={[styles.saveBtn, saving && styles.btnDisabled]}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes ✦'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  backText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  title: { fontSize: 18, color: colors.white, fontFamily: 'serif', fontWeight: '700' },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: colors.gold, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.raised, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.white, borderWidth: 1, borderColor: colors.goldLine },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  autoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  autoBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 1 },
  btnDisabled: { opacity: 0.5 },
  errorBox: { backgroundColor: 'rgba(184,64,64,0.12)', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.danger, marginTop: spacing.md },
  errorText: { fontSize: 13, color: colors.danger, textAlign: 'center' },
  saveBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
});
