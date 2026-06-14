import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/hooks/useStore';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, radius } from '../../src/utils/theme';
import { CUISINES, CATEGORIES, CAT_EMOJI, type MenuItem } from '../../src/data/seed';
import { Eyebrow, GoldLine, StoreLogo, EmptyState } from '../../src/components/UI';

const TABS = ['Register', 'Add Item', 'Manage', 'Edit'];

const TAGS = ['popular', 'new', 'veg', 'spicy', 'halal'] as const;
const TAG_EMOJI: Record<string, string> = { popular: '🔥', new: '✨', veg: '🌿', spicy: '🌶', halal: '🐟' };

export default function MyCompanyScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    company, menuItems, registerCompany, updateCompany, deleteCompany,
    addItem, removeItem,
  } = useStore();

  const [activeTab, setActiveTab] = useState(0);

  // Register form
  const [regName, setRegName] = useState('');
  const [regOwner, setRegOwner] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCuisines, setRegCuisines] = useState<string[]>([]);
  const [regDesc, setRegDesc] = useState('');

  // Add Item form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemEmoji, setItemEmoji] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemTags, setItemTags] = useState<string[]>([]);

  function toggleCuisine(c: string) {
    setRegCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  function toggleTag(t: string) {
    setItemTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleRegister() {
    if (!regName.trim() || !regOwner.trim() || !regEmail.trim() || !regDesc.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    await registerCompany({ name: regName.trim(), owner: regOwner.trim(), email: regEmail.trim(), cuisines: regCuisines, description: regDesc.trim() });
    Alert.alert('Success', 'Your company has been registered!');
    setActiveTab(1);
  }

  async function handleAddItem() {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Error', 'Item name and price are required.');
      return;
    }
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }
    await addItem({ name: itemName.trim(), price, category: itemCategory || 'Mains', emoji: itemEmoji || CAT_EMOJI[itemCategory] || '🍽', description: itemDesc.trim(), tags: itemTags });
    setItemName(''); setItemPrice(''); setItemCategory(''); setItemEmoji(''); setItemDesc(''); setItemTags([]);
    Alert.alert('Added', 'Menu item added successfully!');
  }

  function handleDeleteItem(item: MenuItem) {
    Alert.alert('Delete Item', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  }

  function handleDeleteCompany() {
    Alert.alert('Delete Company', 'This will remove your company and all items. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCompany(); setActiveTab(0); } },
    ]);
  }

  // Edit form state
  const [editName, setEditName] = useState(company?.name || '');
  const [editOwner, setEditOwner] = useState(company?.owner || '');
  const [editEmail, setEditEmail] = useState(company?.email || '');
  const [editDesc, setEditDesc] = useState(company?.description || '');

  async function handleUpdateCompany() {
    if (!company) return;
    await updateCompany({ name: editName.trim(), owner: editOwner.trim(), email: editEmail.trim(), description: editDesc.trim() });
    Alert.alert('Saved', 'Company details updated.');
  }

  const stats = {
    items: menuItems.length,
    value: menuItems.reduce((s, i) => s + i.price, 0),
    orders: Math.floor(Math.random() * 50 + 10),
    rating: menuItems.length ? (menuItems.reduce((s, i) => s + i.rating, 0) / menuItems.length).toFixed(1) : '—',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Eyebrow label="✦ ONYX" />
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Company</Text>
          <Pressable onPress={signOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabStrip} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }} keyboardShouldPersistTaps="handled">
        {activeTab === 0 && (
          company ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Company Registered</Text>
              <Text style={styles.successText}>{company.name}</Text>
              <Pressable onPress={() => setActiveTab(1)} style={styles.successBtn}>
                <Text style={styles.successBtnText}>Go to Add Item</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.formTitle}>Register Your Company</Text>
              <Text style={styles.formSub}>Create your store on the marketplace</Text>

              <Text style={styles.label}>COMPANY NAME</Text>
              <TextInput style={styles.input} value={regName} onChangeText={setRegName} placeholder="Your brand name" placeholderTextColor={colors.dim} />

              <Text style={styles.label}>OWNER NAME</Text>
              <TextInput style={styles.input} value={regOwner} onChangeText={setRegOwner} placeholder="Full name" placeholderTextColor={colors.dim} />

              <Text style={styles.label}>CONTACT EMAIL</Text>
              <TextInput style={styles.input} value={regEmail} onChangeText={setRegEmail} placeholder="email@company.com" placeholderTextColor={colors.dim} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>CUISINES</Text>
              <View style={styles.pillRow}>
                {CUISINES.map(c => (
                  <Pressable key={c} onPress={() => toggleCuisine(c)} style={[styles.pill, regCuisines.includes(c) && styles.pillActive]}>
                    <Text style={[styles.pillText, regCuisines.includes(c) && styles.pillTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput style={[styles.input, styles.textArea]} value={regDesc} onChangeText={setRegDesc} placeholder="Tell customers about your company..." placeholderTextColor={colors.dim} multiline numberOfLines={4} />

              <Pressable onPress={handleRegister} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Register Company ✦</Text>
              </Pressable>
            </View>
          )
        )}

        {activeTab === 1 && (
          company ? (
            <View>
              <View style={styles.postingBanner}>
                <StoreLogo name={company.name} index={0} size={32} />
                <Text style={styles.postingText}>Posting as <Text style={styles.postingName}>{company.name}</Text></Text>
              </View>

              <Text style={styles.formTitle}>Add Menu Item</Text>

              <Text style={styles.label}>DISH NAME</Text>
              <TextInput style={styles.input} value={itemName} onChangeText={setItemName} placeholder="e.g. Truffle Pasta" placeholderTextColor={colors.dim} />

              <Text style={styles.label}>PRICE (₱)</Text>
              <TextInput style={styles.input} value={itemPrice} onChangeText={setItemPrice} placeholder="0.00" placeholderTextColor={colors.dim} keyboardType="decimal-pad" />

              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.pillRow}>
                {CATEGORIES.map(c => (
                  <Pressable key={c} onPress={() => { setItemCategory(c); if (!itemEmoji) setItemEmoji(CAT_EMOJI[c] || ''); }} style={[styles.pill, itemCategory === c && styles.pillActive]}>
                    <Text style={[styles.pillText, itemCategory === c && styles.pillTextActive]}>{CAT_EMOJI[c]} {c}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>EMOJI</Text>
              <TextInput style={styles.input} value={itemEmoji} onChangeText={setItemEmoji} placeholder="🥩" placeholderTextColor={colors.dim} maxLength={4} />

              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput style={[styles.input, styles.textArea]} value={itemDesc} onChangeText={setItemDesc} placeholder="Describe your dish..." placeholderTextColor={colors.dim} multiline numberOfLines={3} />

              <Text style={styles.label}>TAGS</Text>
              <View style={styles.pillRow}>
                {TAGS.map(t => (
                  <Pressable key={t} onPress={() => toggleTag(t)} style={[styles.pill, itemTags.includes(t) && styles.pillActive]}>
                    <Text style={[styles.pillText, itemTags.includes(t) && styles.pillTextActive]}>{TAG_EMOJI[t]} {t}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleAddItem} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Add to Menu ✦</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.locked}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedText}>Register your company first to add menu items.</Text>
              <Pressable onPress={() => setActiveTab(0)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Go to Register</Text>
              </Pressable>
            </View>
          )
        )}

        {activeTab === 2 && (
          company ? (
            <View>
              <View style={styles.statsRow}>
                {[
                  { label: 'Items', value: stats.items },
                  { label: 'Est. Value', value: `₱${stats.value.toLocaleString()}` },
                  { label: 'Orders', value: stats.orders },
                  { label: 'Rating', value: stats.rating },
                ].map(s => (
                  <View key={s.label} style={styles.statCard}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Menu Items</Text>
                <Pressable onPress={() => setActiveTab(1)}>
                  <Text style={styles.addLink}>+ Add</Text>
                </Pressable>
              </View>

              {menuItems.length === 0 ? (
                <EmptyState icon="🍽" text="No menu items yet. Start adding!" />
              ) : (
                menuItems.map(item => (
                  <View key={item.id} style={styles.menuItem}>
                    <Text style={styles.menuItemEmoji}>{item.emoji || CAT_EMOJI[item.category] || '🍽'}</Text>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemMeta}>{item.category} • ₱{item.price}</Text>
                    </View>
                    <Pressable onPress={() => router.push({ pathname: '/edit-item', params: { id: item.id } })} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteItem(item)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.locked}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedText}>Register your company first to manage items.</Text>
              <Pressable onPress={() => setActiveTab(0)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Go to Register</Text>
              </Pressable>
            </View>
          )
        )}

        {activeTab === 3 && (
          company ? (
            <View>
              <Text style={styles.formTitle}>Edit Company</Text>

              <Text style={styles.label}>COMPANY NAME</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholderTextColor={colors.dim} />

              <Text style={styles.label}>OWNER NAME</Text>
              <TextInput style={styles.input} value={editOwner} onChangeText={setEditOwner} placeholderTextColor={colors.dim} />

              <Text style={styles.label}>CONTACT EMAIL</Text>
              <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholderTextColor={colors.dim} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput style={[styles.input, styles.textArea]} value={editDesc} onChangeText={setEditDesc} placeholderTextColor={colors.dim} multiline numberOfLines={4} />

              <Pressable onPress={handleUpdateCompany} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Save Changes ✦</Text>
              </Pressable>

              <GoldLine style={{ marginVertical: spacing.lg }} />

              <Pressable onPress={handleDeleteCompany} style={styles.dangerBtn}>
                <Text style={styles.dangerBtnText}>Delete Company & All Items</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.locked}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedText}>Register your company first to edit details.</Text>
              <Pressable onPress={() => setActiveTab(0)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Go to Register</Text>
              </Pressable>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, color: colors.white, fontFamily: 'serif', fontWeight: '700', marginTop: spacing.xs },
  signOutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  signOutText: { fontSize: 11, color: colors.mid, fontWeight: '600' },
  tabStrip: { maxHeight: 44, marginBottom: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  tabActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { fontSize: 12, color: colors.mid, fontWeight: '600' },
  tabTextActive: { color: colors.obsidian },
  content: { flex: 1 },
  formTitle: { fontSize: 20, color: colors.white, fontFamily: 'serif', fontWeight: '600', marginBottom: spacing.xs },
  formSub: { fontSize: 12, color: colors.mid, marginBottom: spacing.lg },
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
  secondaryBtn: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  secondaryBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  dangerBtn: { borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  dangerBtnText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  successBanner: { backgroundColor: 'rgba(74,158,114,0.1)', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.success, alignItems: 'center' },
  successIcon: { fontSize: 36, marginBottom: spacing.sm },
  successTitle: { fontSize: 18, color: colors.success, fontFamily: 'serif', fontWeight: '600' },
  successText: { fontSize: 14, color: colors.mid, marginVertical: spacing.sm },
  successBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.success },
  successBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  postingBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  postingText: { fontSize: 13, color: colors.mid },
  postingName: { color: colors.gold, fontWeight: '600' },
  locked: { alignItems: 'center', paddingVertical: spacing.xxl },
  lockedIcon: { fontSize: 48, marginBottom: spacing.md, opacity: 0.3 },
  lockedText: { fontSize: 14, color: colors.mid, textAlign: 'center', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: 18, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  statLabel: { fontSize: 9, color: colors.dim, fontWeight: '700', letterSpacing: 2, marginTop: spacing.xs, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, color: colors.white, fontFamily: 'serif', fontWeight: '600' },
  addLink: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.xs },
  menuItemEmoji: { fontSize: 28, marginRight: spacing.sm },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 14, color: colors.white, fontWeight: '600' },
  menuItemMeta: { fontSize: 11, color: colors.mid, marginTop: 2 },
  editBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine, marginRight: spacing.xs },
  editBtnText: { fontSize: 10, color: colors.gold, fontWeight: '600' },
  deleteBtn: { padding: spacing.sm },
  deleteBtnText: { fontSize: 14, color: colors.danger },
});
