import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/hooks/useStore';
import { colors, spacing, radius } from '../src/utils/theme';
import { CAT_EMOJI } from '../src/data/seed';
import { StoreLogo, GoldLine, EmptyState } from '../src/components/UI';

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allCompanies, allItems, addToCart } = useStore();

  const company = allCompanies.find(c => c.id === id);
  const items = allItems.filter(i => i.company === id);

  if (!company) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.mid, fontStyle: 'italic' }}>Store not found.</Text>
        </View>
      </View>
    );
  }

  const companyIndex = allCompanies.findIndex(c => c.id === id);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.banner}>
          <StoreLogo name={company.name} index={companyIndex} size={64} />
          <Text style={styles.name}>{company.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.rating}>★ {company.rating?.toFixed(1)}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.itemCount}>{items.length} items</Text>
          </View>
          <View style={styles.cuisineRow}>
            {company.cuisines.map(c => (
              <Text key={c} style={styles.cuisineTag}>{c}</Text>
            ))}
          </View>
        </View>

        <View style={styles.descSection}>
          <Text style={styles.desc}>{company.description}</Text>
        </View>

        <GoldLine style={{ marginHorizontal: spacing.lg }} />

        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <Text style={styles.menuCount}>{items.length} items</Text>
        </View>

        {items.length === 0 ? (
          <EmptyState icon="📋" text="This store has no menu items yet." />
        ) : (
          items.map(item => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/dish-detail', params: { id: item.id } })}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemEmoji}>{item.emoji || CAT_EMOJI[item.category] || '🍽'}</Text>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemCategory}>{item.category}</Text>
              </View>
              <Text style={styles.menuItemPrice}>₱{item.price}</Text>
              <Pressable onPress={() => addToCart(item)} style={styles.addSmall}>
                <Text style={styles.addSmallText}>+</Text>
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  backBtn: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.sm },
  backText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  banner: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  name: { fontSize: 24, color: colors.white, fontFamily: 'serif', fontWeight: '700', marginTop: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  rating: { fontSize: 13, color: colors.gold },
  dot: { fontSize: 13, color: colors.dim },
  itemCount: { fontSize: 13, color: colors.mid },
  cuisineRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  cuisineTag: { fontSize: 10, color: colors.gold, fontWeight: '600', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.goldDim },
  descSection: { padding: spacing.lg },
  desc: { fontSize: 13, color: colors.mid, fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  menuTitle: { fontSize: 18, color: colors.white, fontFamily: 'serif', fontWeight: '600' },
  menuCount: { fontSize: 12, color: colors.dim },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  menuItemEmoji: { fontSize: 28, marginRight: spacing.sm },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 14, color: colors.white, fontWeight: '600' },
  menuItemCategory: { fontSize: 11, color: colors.mid, marginTop: 1 },
  menuItemPrice: { fontSize: 14, color: colors.gold, fontFamily: 'serif', fontWeight: '700', marginRight: spacing.md },
  addSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  addSmallText: { fontSize: 16, color: colors.obsidian, fontWeight: '700', lineHeight: 18 },
});
