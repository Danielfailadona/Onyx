import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useStore } from '../hooks/useStore';
import { GoldLine, Eyebrow, EmptyState, StoreLogo, Badge } from '../components/UI';
import { colors, spacing, radius } from '../utils/theme';
import { CUISINES, CATEGORIES, CAT_EMOJI } from '../data/seed';

const TABS = ['Register', 'Add Item', 'Manage', 'Edit'];

export default function MyCompanyScreen({ navigation }) {
  const { company, menuItems, registerCompany, updateCompany, deleteCompany, addItem, updateItem, removeItem } = useStore();
  const [activeTab, setActiveTab] = useState(company ? 'Manage' : 'Register');

  // ── Register form ──
  const [rName,     setRName]     = useState('');
  const [rOwner,    setROwner]    = useState('');
  const [rEmail,    setREmail]    = useState('');
  const [rDesc,     setRDesc]     = useState('');
  const [rCuisines, setRCuisines] = useState([]);
  const [saving,    setSaving]    = useState(false);

  async function handleRegister() {
    if (!rName.trim() || !rOwner.trim() || !rEmail.trim() || rCuisines.length === 0) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and select at least one cuisine.');
      return;
    }
    setSaving(true);
    try {
      await registerCompany({ name: rName.trim(), owner: rOwner.trim(), email: rEmail.trim(), desc: rDesc.trim(), cuisines: rCuisines });
      Alert.alert('🎉 Registered!', rName + ' is now live on the marketplace.');
      setActiveTab('Manage');
    } catch (e) { Alert.alert('Error', e.message); }
    setSaving(false);
  }

  // ── Add Item form ──
  const [iName,     setIName]     = useState('');
  const [iPrice,    setIPrice]    = useState('');
  const [iCategory, setICategory] = useState('Mains');
  const [iEmoji,    setIEmoji]    = useState('');
  const [iDesc,     setIDesc]     = useState('');
  const [iTags,     setITags]     = useState([]);
  const [addingSaving, setAddingSaving] = useState(false);

  async function handleAddItem() {
    if (!iName.trim() || !iPrice) { Alert.alert('Missing Fields', 'Dish name and price are required.'); return; }
    setAddingSaving(true);
    try {
      await addItem({ name: iName.trim(), price: parseFloat(iPrice), category: iCategory, emoji: iEmoji.trim() || CAT_EMOJI[iCategory] || '🍽', desc: iDesc.trim(), tags: iTags });
      Alert.alert('✦ Published!', iName + ' is now on the marketplace.');
      setIName(''); setIPrice(''); setIDesc(''); setIEmoji(''); setITags([]);
      setActiveTab('Manage');
    } catch (e) { Alert.alert('Error', e.message); }
    setAddingSaving(false);
  }

  // ── Edit company form ──
  const [eName,  setEName]  = useState(company?.name  || '');
  const [eOwner, setEOwner] = useState(company?.owner || '');
  const [eEmail, setEEmail] = useState(company?.email || '');
  const [eDesc,  setEDesc]  = useState(company?.desc  || '');
  const [editSaving, setEditSaving] = useState(false);

  async function handleSaveEdit() {
    if (!eName.trim()) { Alert.alert('Required', 'Company name is required.'); return; }
    setEditSaving(true);
    try {
      await updateCompany({ name: eName.trim(), owner: eOwner.trim(), email: eEmail.trim(), desc: eDesc.trim() });
      Alert.alert('Saved', 'Company info updated.');
    } catch (e) { Alert.alert('Error', e.message); }
    setEditSaving(false);
  }

  async function handleDelete() {
    Alert.alert('Delete Company', `Remove "${company?.name}" and all ${menuItems.length} menu items? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCompany(); setActiveTab('Register'); } },
    ]);
  }

  async function handleRemoveItem(id, name) {
    Alert.alert('Remove Item', `Remove "${name}" from the marketplace?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  }

  function toggleCuisine(c) {
    setRCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function toggleTag(t) {
    setITags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Eyebrow>My Company</Eyebrow>
        {company && (
          <View style={styles.companyBanner}>
            <StoreLogo name={company.name} index={0} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.companyBannerName}>{company.name}</Text>
              <Text style={styles.companyBannerStatus}>✓ Registered · {menuItems.length} items</Text>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={{ paddingHorizontal: spacing.sm }}>
        {TABS.map(tab => {
          const locked = !company && ['Add Item','Manage','Edit'].includes(tab);
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive, locked && styles.tabLocked]}
              onPress={() => !locked && setActiveTab(tab)}
              disabled={locked}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, locked && styles.tabTextLocked]}>
                {tab}{locked ? ' 🔒' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <GoldLine />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── REGISTER TAB ── */}
        {activeTab === 'Register' && (
          <View>
            {company ? (
              <View>
                <View style={styles.alreadyBox}>
                  <Text style={styles.alreadyTitle}>✓ Already Registered</Text>
                  <Text style={styles.alreadyText}>{company.name} is live on the marketplace. Use the Edit tab to update your details.</Text>
                </View>
                <TouchableOpacity style={styles.btnGold} onPress={() => setActiveTab('Add Item')}>
                  <Text style={styles.btnGoldText}>→ Go to Add Item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionDesc}>Register your restaurant to start listing on Onyx.</Text>
                <Field label="Company Name *">
                  <TextInput style={styles.input} value={rName} onChangeText={setRName} placeholder="e.g. Sakura Omakase" placeholderTextColor={colors.dim} />
                </Field>
                <View style={styles.row2}>
                  <View style={{ flex: 1 }}>
                    <Field label="Owner Name *">
                      <TextInput style={styles.input} value={rOwner} onChangeText={setROwner} placeholder="Juan dela Cruz" placeholderTextColor={colors.dim} />
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Email *">
                      <TextInput style={styles.input} value={rEmail} onChangeText={setREmail} placeholder="you@co.com" placeholderTextColor={colors.dim} keyboardType="email-address" autoCapitalize="none" />
                    </Field>
                  </View>
                </View>
                <Field label="Cuisine *">
                  <View style={styles.pillGroup}>
                    {CUISINES.map(c => (
                      <TouchableOpacity key={c} style={[styles.pill, rCuisines.includes(c) && styles.pillActive]} onPress={() => toggleCuisine(c)}>
                        <Text style={[styles.pillText, rCuisines.includes(c) && styles.pillTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>
                <Field label="Description">
                  <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={rDesc} onChangeText={setRDesc} placeholder="Describe your restaurant…" placeholderTextColor={colors.dim} multiline />
                </Field>
                <TouchableOpacity style={styles.btnGold} onPress={handleRegister} disabled={saving}>
                  {saving ? <ActivityIndicator color={colors.obsidian} /> : <Text style={styles.btnGoldText}>Register Company ✦</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── ADD ITEM TAB ── */}
        {activeTab === 'Add Item' && company && (
          <View>
            <View style={styles.postingAs}>
              <StoreLogo name={company.name} index={0} size={28} />
              <View>
                <Text style={styles.postingLabel}>Posting as</Text>
                <Text style={styles.postingName}>{company.name}</Text>
              </View>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Dish Name *">
                  <TextInput style={styles.input} value={iName} onChangeText={setIName} placeholder="e.g. Wagyu Tenderloin" placeholderTextColor={colors.dim} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Price (₱) *">
                  <TextInput style={styles.input} value={iPrice} onChangeText={setIPrice} placeholder="0" placeholderTextColor={colors.dim} keyboardType="numeric" />
                </Field>
              </View>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Category">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.pillGroup}>
                      {CATEGORIES.map(c => (
                        <TouchableOpacity key={c} style={[styles.pill, iCategory === c && styles.pillActive]} onPress={() => setICategory(c)}>
                          <Text style={[styles.pillText, iCategory === c && styles.pillTextActive]}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Emoji">
                  <TextInput style={styles.input} value={iEmoji} onChangeText={setIEmoji} placeholder="🍽" placeholderTextColor={colors.dim} maxLength={4} />
                </Field>
              </View>
            </View>
            <Field label="Description">
              <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={iDesc} onChangeText={setIDesc} placeholder="Brief, appetizing description…" placeholderTextColor={colors.dim} multiline />
            </Field>
            <Field label="Tags">
              <View style={styles.pillGroup}>
                {['popular','new','veg','spicy','halal'].map(t => (
                  <TouchableOpacity key={t} style={[styles.pill, iTags.includes(t) && styles.pillActive]} onPress={() => toggleTag(t)}>
                    <Text style={[styles.pillText, iTags.includes(t) && styles.pillTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <TouchableOpacity style={styles.btnGold} onPress={handleAddItem} disabled={addingSaving}>
              {addingSaving ? <ActivityIndicator color={colors.obsidian} /> : <Text style={styles.btnGoldText}>Publish Item ✦</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* ── MANAGE TAB ── */}
        {activeTab === 'Manage' && company && (
          <View>
            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                ['Items', menuItems.length],
                ['Est. Value', '₱' + menuItems.reduce((s,i)=>s+i.price,0).toLocaleString()],
                ['Orders', menuItems.reduce((s,i)=>s+(i.orders||0),0)],
                ['Rating', menuItems.length ? (menuItems.reduce((s,i)=>s+(i.rating||4),0)/menuItems.length).toFixed(1) : '—'],
              ].map(([label, val]) => (
                <View key={label} style={styles.statCard}>
                  <Text style={styles.statNum}>{val}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.manageHeader}>
              <Text style={styles.manageTitle}>Menu Items</Text>
              <TouchableOpacity style={styles.btnGoldSm} onPress={() => setActiveTab('Add Item')}>
                <Text style={styles.btnGoldSmText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {menuItems.length === 0 ? (
              <EmptyState icon="🍽" text="No items yet. Add your first dish!" />
            ) : menuItems.map(item => (
              <View key={item.id} style={styles.manageRow}>
                <Text style={styles.manageEmoji}>{item.emoji || '🍽'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.manageName}>{item.name}</Text>
                  <Text style={styles.manageMeta}>{item.category} · ₱{Number(item.price).toLocaleString()}</Text>
                </View>
                <View style={styles.manageActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditItem', { item })}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleRemoveItem(item.id, item.name)}>
                    <Text style={[styles.actionBtnText, { color: colors.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── EDIT TAB ── */}
        {activeTab === 'Edit' && company && (
          <View>
            <Field label="Company Name *">
              <TextInput style={styles.input} value={eName} onChangeText={setEName} placeholderTextColor={colors.dim} />
            </Field>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Owner Name">
                  <TextInput style={styles.input} value={eOwner} onChangeText={setEOwner} placeholderTextColor={colors.dim} />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Email">
                  <TextInput style={styles.input} value={eEmail} onChangeText={setEEmail} placeholderTextColor={colors.dim} keyboardType="email-address" autoCapitalize="none" />
                </Field>
              </View>
            </View>
            <Field label="Description">
              <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={eDesc} onChangeText={setEDesc} placeholderTextColor={colors.dim} multiline />
            </Field>
            <TouchableOpacity style={styles.btnGold} onPress={handleSaveEdit} disabled={editSaving}>
              {editSaving ? <ActivityIndicator color={colors.obsidian} /> : <Text style={styles.btnGoldText}>Save Changes ✦</Text>}
            </TouchableOpacity>
            <View style={{ height: spacing.xl }} />
            <GoldLine />
            <View style={{ height: spacing.lg }} />
            <TouchableOpacity style={styles.btnDanger} onPress={handleDelete}>
              <Text style={styles.btnDangerText}>⊗ Delete Company & All Items</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.sm }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.goldLine },
  companyBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm, padding: spacing.sm, backgroundColor: 'rgba(74,158,114,0.1)', borderWidth: 1, borderColor: 'rgba(74,158,114,0.3)' },
  companyBannerName: { color: colors.white, fontFamily: 'serif', fontSize: 16 },
  companyBannerStatus: { color: colors.success, fontSize: 11, marginTop: 2 },
  tabRow: { backgroundColor: colors.charcoal, borderBottomWidth: 0 },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.gold },
  tabLocked: { opacity: 0.4 },
  tabText: { color: colors.dim, fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  tabTextActive: { color: colors.gold },
  tabTextLocked: { color: colors.dim },
  content: { padding: spacing.lg, paddingBottom: 100 },
  sectionDesc: { color: colors.mid, fontSize: 13, lineHeight: 20, marginBottom: spacing.xl },
  row2: { flexDirection: 'row', gap: spacing.md },
  input: { backgroundColor: 'rgba(8,8,8,0.6)', borderWidth: 1, borderColor: colors.goldLine, color: colors.white, padding: spacing.md, fontSize: 14, fontFamily: 'serif' },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.goldLine },
  pillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  pillText: { color: colors.mid, fontSize: 12 },
  pillTextActive: { color: colors.gold },
  btnGold: { backgroundColor: colors.gold, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  btnGoldText: { color: colors.obsidian, fontSize: 11, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  btnGoldSm: { backgroundColor: colors.gold, paddingHorizontal: spacing.md, paddingVertical: 7 },
  btnGoldSmText: { color: colors.obsidian, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  btnDanger: { borderWidth: 1, borderColor: 'rgba(184,64,64,0.4)', paddingVertical: 14, alignItems: 'center' },
  btnDangerText: { color: colors.danger, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  alreadyBox: { backgroundColor: 'rgba(74,158,114,0.1)', borderWidth: 1, borderColor: 'rgba(74,158,114,0.3)', padding: spacing.lg, marginBottom: spacing.lg },
  alreadyTitle: { color: colors.success, fontFamily: 'serif', fontSize: 18, marginBottom: 4 },
  alreadyText: { color: colors.mid, fontSize: 13, lineHeight: 20 },
  postingAs: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(74,158,114,0.1)', borderWidth: 1, borderColor: 'rgba(74,158,114,0.3)', padding: spacing.md, marginBottom: spacing.lg },
  postingLabel: { color: colors.success, fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  postingName: { color: colors.white, fontSize: 15, fontFamily: 'serif' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.md, alignItems: 'center' },
  statNum: { color: colors.gold, fontFamily: 'serif', fontSize: 22 },
  statLabel: { color: colors.dim, fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
  manageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  manageTitle: { color: colors.white, fontFamily: 'serif', fontSize: 18 },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.md, marginBottom: 2 },
  manageEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  manageName: { color: colors.white, fontFamily: 'serif', fontSize: 15 },
  manageMeta: { color: colors.mid, fontSize: 11, marginTop: 2 },
  manageActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderWidth: 1, borderColor: colors.goldLine },
  actionBtnDanger: { borderColor: 'rgba(184,64,64,0.3)' },
  actionBtnText: { color: colors.mid, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
