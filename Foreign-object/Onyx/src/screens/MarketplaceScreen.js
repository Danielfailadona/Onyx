import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { useStore } from '../hooks/useStore';
import { DishCard, DishListRow, GoldLine, EmptyState, StoreLogo } from '../components/UI';
import { colors, spacing, radius, gradients } from '../utils/theme';
import { CUISINES, CUISINE_EMOJIS } from '../data/seed';

export default function MarketplaceScreen({ navigation }) {
  const { getAllCompanies, getAllItems, addToCart, cartCount } = useStore();
  const [search,      setSearch]      = useState('');
  const [cuisine,     setCuisine]     = useState('all');
  const [sortBy,      setSortBy]      = useState('popular');
  const [viewMode,    setViewMode]    = useState('grid');
  const [storeFilter, setStoreFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const companies = getAllCompanies();
  const allItems  = getAllItems();

  const filtered = useMemo(() => {
    let items = [...allItems];
    if (storeFilter !== 'all') items = items.filter(i => i.companyId === storeFilter);
    if (cuisine !== 'all') {
      const ids = companies.filter(c => (c.cuisines||[]).includes(cuisine)).map(c => c.id);
      items = items.filter(i => ids.includes(i.companyId));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.desc||'').toLowerCase().includes(q) ||
        i.companyName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc')  items.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') items.sort((a,b) => b.price - a.price);
    if (sortBy === 'rating')     items.sort((a,b) => (b.rating||4) - (a.rating||4));
    if (sortBy === 'popular')    items.sort((a,b) => (b.orders||0) - (a.orders||0));
    if (sortBy === 'newest')     items.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    return items;
  }, [allItems, storeFilter, cuisine, search, sortBy, companies]);

  const SORTS = [
    { key:'popular',    label:'Popular' },
    { key:'price-asc',  label:'Price ↑' },
    { key:'price-desc', label:'Price ↓' },
    { key:'rating',     label:'Rating' },
    { key:'newest',     label:'Newest' },
  ];

  function renderDish({ item }) {
    if (viewMode === 'list') {
      return (
        <DishListRow
          item={item}
          onPress={() => navigation.navigate('DishDetail', { item })}
          onAdd={() => addToCart(item)}
        />
      );
    }
    return (
      <View style={{ flex: 1, margin: 5 }}>
        <DishCard
          item={item}
          onPress={() => navigation.navigate('DishDetail', { item })}
          onAdd={() => addToCart(item)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.obsidian} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>✦ ONYX</Text>
            <Text style={styles.title}>Marketplace</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.cartBtnText}>◈</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search dishes, restaurants, cuisines…"
            placeholderTextColor={colors.dim}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.mid, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        key={viewMode}
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? { paddingHorizontal: spacing.md } : null}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View>
            {/* Store strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeStrip}>
              <TouchableOpacity
                style={[styles.storeChip, storeFilter === 'all' && styles.storeChipActive]}
                onPress={() => setStoreFilter('all')}>
                <View style={[styles.storeChipLogo, { backgroundColor: colors.goldDim }]}>
                  <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '700' }}>✦</Text>
                </View>
                <Text style={[styles.storeChipName, storeFilter === 'all' && { color: colors.gold }]}>All</Text>
              </TouchableOpacity>
              {companies.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.storeChip, storeFilter === c.id && styles.storeChipActive]}
                  onPress={() => setStoreFilter(c.id)}>
                  <StoreLogo name={c.name} index={i} size={28} />
                  <Text style={[styles.storeChipName, storeFilter === c.id && { color: colors.gold }]} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Cuisine filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineStrip}>
              <TouchableOpacity style={[styles.cuisinePill, cuisine === 'all' && styles.cuisinePillActive]} onPress={() => setCuisine('all')}>
                <Text style={[styles.cuisinePillText, cuisine === 'all' && styles.cuisinePillTextActive]}>✦ All</Text>
              </TouchableOpacity>
              {CUISINES.map(cat => (
                <TouchableOpacity key={cat} style={[styles.cuisinePill, cuisine === cat && styles.cuisinePillActive]} onPress={() => setCuisine(cat)}>
                  <Text style={[styles.cuisinePillText, cuisine === cat && styles.cuisinePillTextActive]}>{CUISINE_EMOJIS[cat]} {cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Toolbar */}
            <View style={styles.toolbar}>
              <Text style={styles.resultsLabel}>
                <Text style={{ color: colors.white, fontWeight: '600' }}>{filtered.length}</Text> dishes
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {SORTS.map(s => (
                  <TouchableOpacity key={s.key} style={[styles.sortPill, sortBy === s.key && styles.sortPillActive]} onPress={() => setSortBy(s.key)}>
                    <Text style={[styles.sortPillText, sortBy === s.key && styles.sortPillTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.viewToggle}>
                <TouchableOpacity style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]} onPress={() => setViewMode('grid')}>
                  <Text style={{ color: viewMode === 'grid' ? colors.gold : colors.dim }}>⊞</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]} onPress={() => setViewMode('list')}>
                  <Text style={{ color: viewMode === 'list' ? colors.gold : colors.dim }}>≡</Text>
                </TouchableOpacity>
              </View>
            </View>
            <GoldLine />
            <View style={{ height: spacing.sm }} />
          </View>
        }
        ListEmptyComponent={<EmptyState icon="🍽" text="No dishes found" />}
        renderItem={renderDish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { backgroundColor: colors.charcoal, borderBottomWidth: 1, borderBottomColor: colors.goldLine, paddingBottom: spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.sm },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  title: { color: colors.white, fontSize: 28, fontFamily: 'serif' },
  cartBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBtnText: { color: colors.gold, fontSize: 22 },
  cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.danger, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: spacing.md, paddingVertical: 10, gap: spacing.sm },
  searchIcon: { color: colors.dim, fontSize: 16 },
  searchInput: { flex: 1, color: colors.white, fontSize: 13 },
  storeStrip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  storeChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: spacing.md, paddingVertical: 7, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine },
  storeChipActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  storeChipLogo: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  storeChipName: { color: colors.mid, fontSize: 11, fontWeight: '600', maxWidth: 80 },
  cuisineStrip: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  cuisinePill: { paddingHorizontal: spacing.md, paddingVertical: 7, borderWidth: 1, borderColor: colors.goldLine },
  cuisinePillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  cuisinePillText: { color: colors.mid, fontSize: 11 },
  cuisinePillTextActive: { color: colors.obsidian, fontWeight: '700' },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  resultsLabel: { color: colors.mid, fontSize: 11, marginRight: 'auto' },
  sortPill: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.goldLine },
  sortPillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  sortPillText: { color: colors.dim, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  sortPillTextActive: { color: colors.gold },
  viewToggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.goldLine, overflow: 'hidden' },
  viewBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  viewBtnActive: { backgroundColor: colors.goldDim },
});
