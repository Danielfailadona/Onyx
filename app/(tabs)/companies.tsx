import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/hooks/useStore';
import { colors, spacing, radius } from '../../src/utils/theme';
import { StoreLogo, GoldLine, Eyebrow, EmptyState } from '../../src/components/UI';
import { usePanel } from '../../src/hooks/usePanel';

export default function CompaniesScreen() {
  const router = useRouter();
  const { allCompanies: companies } = useStore();
  const { setOpen: setPanelOpen } = usePanel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={() => setPanelOpen(true)} style={styles.profileBtn}>
            <Text style={styles.profileIconText}>👤</Text>
          </Pressable>
          <Eyebrow label="✦ ONYX" />
        </View>
        <Text style={styles.title}>Companies</Text>
        <Text style={styles.subtitle}>Verified sellers on the marketplace</Text>
      </View>
      <GoldLine />

      <FlatList
        data={companies}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/store-detail', params: { id: item.id } })}
            style={styles.card}
          >
            <View style={styles.cardAccent} />
            <View style={styles.cardBody}>
              <StoreLogo name={item.name} index={index} size={48} />
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCuisine}>{item.cuisines.join(', ')}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardRating}>★ {item.rating?.toFixed(1)}</Text>
                <Text style={styles.cardItems}>{item.itemCount ?? 0} items</Text>
              </View>
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>Open</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon="🏪" text="No companies registered yet." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  profileBtn: { padding: spacing.xs },
  profileIconText: { fontSize: 22 },
  header: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  title: { fontSize: 28, color: colors.white, fontFamily: 'serif', fontWeight: '700', marginTop: spacing.xs },
  subtitle: { fontSize: 12, color: colors.mid, marginTop: spacing.xs },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden' },
  cardAccent: { height: 2, backgroundColor: 'rgba(201,168,76,0.35)' },
  cardBody: { padding: spacing.md, alignItems: 'center' },
  cardName: { fontSize: 16, color: colors.white, fontFamily: 'serif', fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  cardCuisine: { fontSize: 9, color: colors.gold, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginTop: spacing.xs },
  cardDesc: { fontSize: 11, color: colors.mid, textAlign: 'center', marginTop: spacing.sm, lineHeight: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: spacing.sm },
  cardRating: { fontSize: 11, color: colors.gold },
  cardItems: { fontSize: 11, color: colors.dim },
  openBadge: { marginTop: spacing.sm, paddingHorizontal: 12, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(74,158,114,0.18)', borderWidth: 1, borderColor: colors.success },
  openBadgeText: { fontSize: 9, fontWeight: '700', color: colors.success, textTransform: 'uppercase', letterSpacing: 1 },
});
