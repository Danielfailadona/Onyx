import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/hooks/useStore';
import { colors, spacing, radius } from '../src/utils/theme';
import { Badge, GoldLine, DishCard } from '../src/components/UI';

export default function DishDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allItems, addToCart } = useStore();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marketplace');
    }
  }

  const item = allItems.find(i => i.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.mid, fontStyle: 'italic' }}>Item not found.</Text>
        </View>
      </View>
    );
  }

  const related = allItems
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 3);

  const dietaryTags: { key: string; label: string }[] = [];
  if (item.tags.includes('veg')) dietaryTags.push({ key: 'veg', label: 'Vegetarian 🌿' });
  if (item.tags.includes('spicy')) dietaryTags.push({ key: 'spicy', label: 'Spicy 🌶' });
  if (item.tags.includes('halal')) dietaryTags.push({ key: 'halal', label: 'Halal 🐟' });

  function handleAdd() {
    if (!item) return;
    addToCart(item);
    router.push('/cart');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}>
        <Pressable onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Image
            source={item.image_url ? { uri: item.image_url } : require('../assets/images/default_image.jpg')}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          {item.tags.includes('new') && (
            <View style={styles.heroBadge}><Badge type="new">NEW</Badge></View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>₱{item.price}</Text>
          <Text style={styles.name}>{item.name}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
            {item.tags.includes('popular') && <Badge type="popular">Popular</Badge>}
            {item.tags.includes('new') && <Badge type="new">New</Badge>}
          </View>

          <Text style={styles.desc}>{item.description}</Text>

          {dietaryTags.length > 0 && (
            <View style={styles.dietRow}>
              {dietaryTags.map(d => (
                <Text key={d.key} style={styles.dietTag}>{d.label}</Text>
              ))}
            </View>
          )}

          <GoldLine style={{ marginVertical: spacing.md }} />

          <Text style={styles.byLabel}>By</Text>
          <Pressable onPress={() => router.push({ pathname: '/store-detail', params: { id: item.company } })}>
            <Text style={styles.storeLink}>{item.companyName}</Text>
          </Pressable>
        </View>

        {related.length > 0 && (
          <View style={styles.relatedWrap}>
            <Text style={styles.relatedTitle}>You Might Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              {related.map(r => (
                <View key={r.id} style={{ width: 180 }}>
                  <DishCard
                    item={r}
                    onPress={() => router.replace({ pathname: '/dish-detail', params: { id: r.id } })}
                    onAdd={() => addToCart(r)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleAdd} style={styles.addToCartBtn}>
          <Text style={styles.addToCartText}>Add to Cart ✦</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  backBtn: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.sm },
  backText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  hero: { height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.raised, position: 'relative', marginHorizontal: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: radius.lg },
  heroBadge: { position: 'absolute', top: spacing.md, left: spacing.md },
  body: { padding: spacing.lg },
  category: { fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.gold, marginBottom: spacing.xs },
  price: { fontSize: 20, color: colors.gold, fontFamily: 'serif', fontWeight: '700', marginBottom: spacing.xs },
  name: { fontSize: 24, color: colors.white, fontFamily: 'serif', fontWeight: '700', marginBottom: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  rating: { fontSize: 14, color: colors.gold },
  desc: { fontSize: 14, color: colors.mid, fontStyle: 'italic', lineHeight: 20, marginBottom: spacing.md },
  dietRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dietTag: { fontSize: 12, color: colors.white, backgroundColor: colors.raised, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  byLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: colors.dim, marginBottom: spacing.xs },
  storeLink: { fontSize: 15, color: colors.gold, fontWeight: '600', fontFamily: 'serif' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.goldLine, backgroundColor: colors.charcoal },
  addToCartBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  addToCartText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
  relatedWrap: { marginTop: spacing.lg },
  relatedTitle: { fontSize: 14, color: colors.white, fontFamily: 'serif', fontWeight: '600', marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
});
