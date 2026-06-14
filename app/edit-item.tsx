import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/hooks/useStore';
import { colors, spacing, radius } from '../src/utils/theme';
import { CATEGORIES, CAT_EMOJI } from '../src/data/seed';

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { menuItems, updateItem } = useStore();
  const item = menuItems.find(i => i.id === id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [emoji, setEmoji] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setEmoji(item.emoji);
      setCategory(item.category);
      setDescription(item.description);
    }
  }, [item]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={{ padding: spacing.lg }}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.mid, fontStyle: 'italic' }}>Item not found.</Text>
        </View>
      </View>
    );
  }

  async function handleSave() {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Error', 'Item name and price are required.');
      return;
    }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    await updateItem(id!, { name: name.trim(), price: p, emoji, category: category || 'Mains', description: description.trim() });
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Item</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.label}>DISH NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.dim} />

        <Text style={styles.label}>PRICE (₱)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholderTextColor={colors.dim} keyboardType="decimal-pad" />

        <Text style={styles.label}>EMOJI</Text>
        <TextInput style={styles.input} value={emoji} onChangeText={setEmoji} placeholderTextColor={colors.dim} maxLength={4} />

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.pillRow}>
          {CATEGORIES.map(c => (
            <Pressable key={c} onPress={() => { setCategory(c); if (!emoji) setEmoji(CAT_EMOJI[c] || ''); }} style={[styles.pill, category === c && styles.pillActive]}>
              <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{CAT_EMOJI[c]} {c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholderTextColor={colors.dim} multiline numberOfLines={4} />

        <Pressable onPress={handleSave} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Save Changes ✦</Text>
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
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine },
  pillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  pillText: { fontSize: 12, color: colors.mid },
  pillTextActive: { color: colors.gold, fontWeight: '600' },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
});
