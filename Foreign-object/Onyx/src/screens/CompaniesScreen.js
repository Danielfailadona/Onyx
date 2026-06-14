import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../hooks/useStore';
import { StoreLogo, EmptyState, GoldLine } from '../components/UI';
import { colors, spacing } from '../utils/theme';

export default function CompaniesScreen({ navigation }) {
  const { getAllCompanies, getAllItems } = useStore();
  const companies = getAllCompanies();
  const allItems  = getAllItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>✦ ONYX</Text>
        <Text style={styles.title}>Companies</Text>
        <Text style={styles.sub}>Only verified companies can list on the marketplace</Text>
      </View>
      <GoldLine />
      <FlatList
        data={companies}
        keyExtractor={c => c.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
        ListEmptyComponent={<EmptyState icon="⊞" text="No companies registered yet." />}
        renderItem={({ item: c, index }) => {
          const count = allItems.filter(i => i.companyId === c.id).length;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('StoreDetail', { company: c })}
              activeOpacity={0.85}>
              <View style={styles.cardTopAccent} />
              <View style={styles.openBadge}><Text style={styles.openBadgeText}>Open</Text></View>
              <StoreLogo name={c.name} index={index} size={48} />
              <Text style={styles.cardName}>{c.name}</Text>
              <Text style={styles.cardCat}>{(c.cuisines||[]).join(' · ')}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{c.desc}</Text>
              <View style={styles.cardStats}>
                <Text style={styles.statText}>★ 4.8</Text>
                <Text style={styles.statText}>◈ {count} items</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.charcoal },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  title: { color: colors.white, fontSize: 28, fontFamily: 'serif' },
  sub: { color: colors.mid, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  card: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.md, marginBottom: spacing.sm, position: 'relative', overflow: 'hidden' },
  cardTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: colors.gold, opacity: 0.35 },
  openBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(74,158,114,0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  openBadgeText: { color: colors.success, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  cardName: { color: colors.white, fontFamily: 'serif', fontSize: 16, marginTop: spacing.sm, marginBottom: 2 },
  cardCat: { color: colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  cardDesc: { color: colors.mid, fontSize: 11, lineHeight: 16, marginBottom: spacing.sm },
  cardStats: { flexDirection: 'row', gap: spacing.md },
  statText: { color: colors.mid, fontSize: 11 },
});
