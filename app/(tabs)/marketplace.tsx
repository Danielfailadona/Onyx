import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/hooks/useStore';
import { colors, spacing, radius } from '../../src/utils/theme';
import { CUISINES, CUISINE_EMOJIS, type MenuItem } from '../../src/data/seed';
import { DishCard, DishListRow, StoreLogo, Eyebrow, EmptyState } from '../../src/components/UI';
import { usePanel } from '../../src/hooks/usePanel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.sm) / 2;

export default function MarketplaceScreen() {
  const router = useRouter();
  const { allItems, allCompanies, addToCart, cartCount } = useStore();
  const { setOpen: setPanelOpen } = usePanel();

  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [storeFilter, setStoreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const companies = allCompanies;

  const filtered = useMemo(() => {
    let items = [...allItems];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.companyName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    if (cuisine) {
      const companyIds = companies.filter(c => c.cuisines.includes(cuisine)).map(c => c.id);
      items = items.filter(i => companyIds.includes(i.company));
    }

    if (storeFilter) {
      items = items.filter(i => i.company === storeFilter);
    }

    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break;
      case 'price-desc': items.sort((a, b) => b.price - a.price); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'newest': items.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
      default: items.sort((a, b) => (b.tags.includes('popular') ? 1 : 0) - (a.tags.includes('popular') ? 1 : 0)); break;
    }

    return items;
  }, [search, cuisine, sortBy, storeFilter, allItems, companies]);

  const sortOptions = [
    { key: 'popular', label: 'Popular' },
    { key: 'price-asc', label: 'Price ↑' },
    { key: 'price-desc', label: 'Price ↓' },
    { key: 'rating', label: 'Rating' },
    { key: 'newest', label: 'Newest' },
  ];

  function handleItemPress(item: MenuItem) {
    router.push({ pathname: '/dish-detail', params: { id: item.id } });
  }

  function handleAddToCart(item: MenuItem) {
    addToCart(item);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable onPress={() => setPanelOpen(true)} style={styles.profileBtn}>
              <Text style={styles.profileIconText}>👤</Text>
            </Pressable>
            <Eyebrow label="✦ ONYX" />
          </View>
          <Pressable onPress={() => router.push('/cart')} style={styles.cartBtn}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <Text style={styles.title}>Marketplace</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search dishes, stores..."
          placeholderTextColor={colors.dim}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.storeStrip}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: '', name: 'All' } as any, ...companies]}
          keyExtractor={item => item.id || 'all'}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setStoreFilter(storeFilter === item.id ? '' : item.id)}
              style={[styles.storeChip, storeFilter === item.id && styles.storeChipActive]}
            >
              {item.id ? <StoreLogo name={item.name} index={index - 1} size={28} /> : null}
              <Text style={[styles.storeChipLabel, storeFilter === item.id && styles.storeChipLabelActive]}>
                {item.name || 'All'}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        />
      </View>

      <Pressable onPress={() => setShowFilters(!showFilters)} style={styles.filterToggle}>
        <Text style={styles.filterToggleText}>{showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}</Text>
      </Pressable>

      {showFilters ? (
        <View style={styles.filtersPanel}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['', ...CUISINES]}
            keyExtractor={item => item || 'all'}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setCuisine(cuisine === item ? '' : item)}
                style={[styles.cuisinePill, cuisine === item && styles.cuisinePillActive]}
              >
                <Text style={[styles.cuisinePillLabel, cuisine === item && styles.cuisinePillLabelActive]}>
                  {item ? `${CUISINE_EMOJIS[item] || ''} ${item}` : 'All Cuisines'}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
          />
          <View style={styles.sortRow}>
            {sortOptions.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={[styles.sortPill, sortBy === opt.key && styles.sortPillActive]}
              >
                <Text style={[styles.sortPillLabel, sortBy === opt.key && styles.sortPillLabelActive]}>{opt.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} style={styles.viewToggle}>
              <Text style={styles.viewToggleText}>{viewMode === 'grid' ? '☰' : '⊞'}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        columnWrapperStyle={viewMode === 'grid' ? { gap: spacing.sm, paddingHorizontal: spacing.lg } : undefined}
        contentContainerStyle={{ paddingHorizontal: viewMode === 'grid' ? 0 : spacing.lg, paddingBottom: spacing.xxl }}
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            <View style={{ width: CARD_WIDTH }}>
              <DishCard item={item} onPress={() => handleItemPress(item)} onAdd={() => handleAddToCart(item)} />
            </View>
          ) : (
            <DishListRow item={item} onPress={() => handleItemPress(item)} onAdd={() => handleAddToCart(item)} />
          )
        }
        ListEmptyComponent={<EmptyState icon="🔍" text="No dishes match your filters." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileBtn: { padding: spacing.xs },
  profileIconText: { fontSize: 22 },
  cartBtn: { position: 'relative', padding: spacing.xs },
  cartIcon: { fontSize: 22 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: colors.gold, borderRadius: radius.full, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 9, fontWeight: '700', color: colors.obsidian },
  title: { fontSize: 28, color: colors.white, fontFamily: 'serif', fontWeight: '700', marginTop: spacing.xs },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInput: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: 14, color: colors.white, borderWidth: 1, borderColor: colors.goldLine },
  clearBtn: { position: 'absolute', right: spacing.sm, padding: spacing.xs },
  clearBtnText: { fontSize: 14, color: colors.mid },
  storeStrip: { marginBottom: spacing.sm },
  storeChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine },
  storeChipActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  storeChipLabel: { fontSize: 12, color: colors.mid, fontWeight: '600' },
  storeChipLabelActive: { color: colors.gold },
  filterToggle: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  filterToggleText: { fontSize: 11, color: colors.gold, fontWeight: '600' },
  filtersPanel: { marginBottom: spacing.sm },
  cuisinePill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine },
  cuisinePillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  cuisinePillLabel: { fontSize: 12, color: colors.mid },
  cuisinePillLabelActive: { color: colors.gold, fontWeight: '600' },
  sortRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.xs, marginTop: spacing.sm, alignItems: 'center' },
  sortPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine },
  sortPillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  sortPillLabel: { fontSize: 11, color: colors.mid },
  sortPillLabelActive: { color: colors.obsidian, fontWeight: '700' },
  viewToggle: { marginLeft: 'auto', padding: spacing.xs },
  viewToggleText: { fontSize: 18, color: colors.mid },
  resultsBar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  resultsText: { fontSize: 11, color: colors.dim, fontWeight: '600' },
});
