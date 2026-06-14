import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { useStore } from '../hooks/useStore';
import { GoldLine, StoreLogo, Badge } from '../components/UI';
import { colors, spacing, gradients } from '../utils/theme';
import { CAT_EMOJI, CATEGORIES } from '../data/seed';

// ═══════════════════════════════════════════
//  DISH DETAIL
// ═══════════════════════════════════════════
export function DishDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { addToCart, getAllItems, getAllCompanies } = useStore();
  const emoji = item.emoji || CAT_EMOJI[item.category] || '🍽';
  const stars = Math.round(item.rating || 4);
  const related = getAllItems().filter(i => i.category === item.category && i.id !== item.id).slice(0, 3);
  const company = getAllCompanies().find(c => c.id === item.companyId);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.heroBox}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <View style={styles.heroOverlay} />
          {item.tags?.includes('new') && (
            <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
          )}
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoTop}>
            <Text style={styles.infoCategory}>{item.category?.toUpperCase()}</Text>
            <Text style={styles.infoPrice}>₱{Number(item.price).toLocaleString()}</Text>
          </View>
          <Text style={styles.infoName}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</Text>
            <Text style={styles.ratingNum}>{Number(item.rating||4).toFixed(1)}</Text>
            {item.tags?.includes('popular') && <Badge type="popular">★ Popular</Badge>}
            {item.tags?.includes('new')     && <Badge type="new">✦ New</Badge>}
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
          {(item.tags?.includes('veg') || item.tags?.includes('spicy') || item.tags?.includes('halal')) && (
            <View style={styles.dietRow}>
              {item.tags.includes('veg')   && <View style={styles.dietTag}><Text style={styles.dietTagText}>🌿 Vegetarian</Text></View>}
              {item.tags.includes('spicy') && <View style={[styles.dietTag,{borderColor:'rgba(184,64,64,0.4)'}]}><Text style={[styles.dietTagText,{color:colors.danger}]}>🌶 Spicy</Text></View>}
              {item.tags.includes('halal') && <View style={styles.dietTag}><Text style={styles.dietTagText}>🐟 Halal</Text></View>}
            </View>
          )}
          {company && (
            <TouchableOpacity style={styles.storeLink} onPress={() => navigation.navigate('StoreDetail', { company })}>
              <StoreLogo name={company.name} index={0} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={styles.storeLinkLabel}>By</Text>
                <Text style={styles.storeLinkName}>{company.name}</Text>
              </View>
              <Text style={{ color: colors.gold }}>→</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addCartBtn} onPress={() => { addToCart(item); navigation.navigate('Cart'); }}>
            <Text style={styles.addCartBtnText}>Add to Cart  ✦</Text>
          </TouchableOpacity>
        </View>
        {related.length > 0 && (
          <View style={styles.relatedBox}>
            <Text style={styles.relatedTitle}>You Might Also Like</Text>
            {related.map(r => (
              <TouchableOpacity key={r.id} style={styles.relatedRow} onPress={() => navigation.replace('DishDetail', { item: r })}>
                <Text style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{r.emoji || CAT_EMOJI[r.category] || '🍽'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.relatedName}>{r.name}</Text>
                  <Text style={styles.relatedStore}>{r.companyName}</Text>
                </View>
                <Text style={styles.relatedPrice}>₱{Number(r.price).toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════
//  STORE / COMPANY DETAIL
// ═══════════════════════════════════════════
export function StoreDetailScreen({ route, navigation }) {
  const { company } = route.params;
  const { getAllItems, addToCart } = useStore();
  const items = getAllItems().filter(i => i.companyId === company.id);
  const companyIndex = parseInt(company.id.replace(/\D/g,'')) || 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.storeBanner}>
          <StoreLogo name={company.name} index={companyIndex} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeBannerName}>{company.name}</Text>
            <View style={styles.storeBannerMeta}>
              <Text style={styles.metaItem}>★ 4.8</Text>
              <Text style={styles.metaItem}>◈ {items.length} items</Text>
            </View>
            <View style={styles.storeBannerTags}>
              {(company.cuisines||[]).map(c => (
                <View key={c} style={styles.cuisineTag}><Text style={styles.cuisineTagText}>{c}</Text></View>
              ))}
            </View>
          </View>
        </View>
        {company.desc ? (
          <View style={styles.storeDescBox}>
            <Text style={styles.storeDesc}>{company.desc}</Text>
          </View>
        ) : null}
        <GoldLine />
        <View style={styles.storeItemsHeader}>
          <Text style={styles.storeItemsTitle}>Menu</Text>
          <Text style={styles.storeItemsCount}>{items.length} items</Text>
        </View>
        {items.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.dim, fontStyle: 'italic' }}>No items yet</Text>
          </View>
        ) : items.map(item => (
          <TouchableOpacity key={item.id} style={styles.storeItem} onPress={() => navigation.navigate('DishDetail', { item })}>
            <Text style={styles.storeItemEmoji}>{item.emoji || CAT_EMOJI[item.category] || '🍽'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeItemName}>{item.name}</Text>
              <Text style={styles.storeItemCat}>{item.category}</Text>
            </View>
            <Text style={styles.storeItemPrice}>₱{Number(item.price).toLocaleString()}</Text>
            <TouchableOpacity style={styles.addBtnInline} onPress={() => addToCart(item)}>
              <Text style={styles.addBtnInlineText}>+</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════
//  CART SCREEN
// ═══════════════════════════════════════════
export function CartScreen({ navigation }) {
  const { cart, cartTotal, changeCartQty, clearCart } = useStore();

  function handleCheckout() {
    if (cart.length === 0) return;
    const total = cartTotal;
    clearCart();
    Alert.alert('🎉 Order Placed!', `Total: ₱${total.toLocaleString()}\nThank you for dining with Onyx.`, [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.cartHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.cartTitle}>Your Order</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ])}>
            <Text style={{ color: colors.danger, fontSize: 12 }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <GoldLine />
      {cart.length === 0 ? (
        <View style={styles.cartEmpty}>
          <Text style={styles.cartEmptyIcon}>◈</Text>
          <Text style={styles.cartEmptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
          {cart.map(item => (
            <View key={item.id} style={styles.cartRow}>
              <View style={styles.cartItemIcon}><Text style={{ fontSize: 24 }}>{item.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemCompany}>{item.company}</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => changeCartQty(item.id, -1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.qty}</Text>
                <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.gold }]} onPress={() => changeCartQty(item.id, 1)}>
                  <Text style={[styles.qtyBtnText, { color: colors.obsidian }]}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cartItemPrice}>₱{(item.price * item.qty).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.cartTotals}>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Subtotal</Text>
              <Text style={styles.cartTotalVal}>₱{cartTotal.toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Service (10%)</Text>
              <Text style={styles.cartTotalVal}>₱{(cartTotal * 0.1).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
            </View>
            <GoldLine style={{ marginVertical: spacing.md }} />
            <View style={styles.cartTotalRow}>
              <Text style={[styles.cartTotalLabel, { color: colors.white, fontWeight: '700' }]}>Total</Text>
              <Text style={styles.cartGrandTotal}>₱{(cartTotal * 1.1).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Place Order  ✦</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════
//  EDIT ITEM
// ═══════════════════════════════════════════
export function EditItemScreen({ route, navigation }) {
  const { item } = route.params;
  const { updateItem } = useStore();
  const [name,     setName]     = useState(item.name);
  const [price,    setPrice]    = useState(String(item.price));
  const [category, setCategory] = useState(item.category);
  const [emoji,    setEmoji]    = useState(item.emoji || '');
  const [desc,     setDesc]     = useState(item.desc || '');
  const [saving,   setSaving]   = useState(false);

  async function handleSave() {
    if (!name.trim() || !price) { Alert.alert('Required', 'Name and price are required.'); return; }
    setSaving(true);
    await updateItem(item.id, { name: name.trim(), price: parseFloat(price), category, emoji: emoji || CAT_EMOJI[category] || '🍽', desc });
    setSaving(false);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.cartHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.cartTitle}>Edit Item</Text>
        <View style={{ width: 50 }} />
      </View>
      <GoldLine />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <EField label="Dish Name *"><TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.dim} /></EField>
        <EField label="Price (₱) *"><TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={colors.dim} /></EField>
        <EField label="Emoji"><TextInput style={styles.input} value={emoji} onChangeText={setEmoji} maxLength={4} placeholderTextColor={colors.dim} /></EField>
        <EField label="Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.pill, category === c && styles.pillActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </EField>
        <EField label="Description">
          <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={desc} onChangeText={setDesc} multiline placeholderTextColor={colors.dim} />
        </EField>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.obsidian} /> : <Text style={styles.addCartBtnText}>Save Changes ✦</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function EField({ label, children }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.sm }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  backBtn: { position: 'absolute', top: 52, left: spacing.lg, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.md, paddingVertical: 6 },
  backText: { color: colors.gold, fontSize: 13 },

  heroBox: { height: 260, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji: { fontSize: 100 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  newBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#6c3fc5', paddingHorizontal: 8, paddingVertical: 4 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  infoBox: { padding: spacing.lg },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  infoCategory: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 4 },
  infoPrice: { color: colors.gold, fontFamily: 'serif', fontSize: 24 },
  infoName: { color: colors.white, fontFamily: 'serif', fontSize: 28, lineHeight: 34, marginBottom: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  stars: { color: colors.gold, fontSize: 14 },
  ratingNum: { color: colors.mid, fontSize: 13 },
  desc: { color: colors.mid, fontSize: 15, lineHeight: 24, fontStyle: 'italic', marginBottom: spacing.lg },
  dietRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  dietTag: { borderWidth: 1, borderColor: 'rgba(74,158,114,0.4)', paddingHorizontal: spacing.md, paddingVertical: 6 },
  dietTagText: { color: colors.success, fontSize: 12 },
  storeLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.md, marginBottom: spacing.lg },
  storeLinkLabel: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  storeLinkName: { color: colors.white, fontFamily: 'serif', fontSize: 16 },
  addCartBtn: { backgroundColor: colors.gold, paddingVertical: 16, alignItems: 'center' },
  addCartBtnText: { color: colors.obsidian, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  relatedBox: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.goldLine },
  relatedTitle: { color: colors.white, fontFamily: 'serif', fontSize: 20, marginBottom: spacing.md },
  relatedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  relatedName: { color: colors.white, fontFamily: 'serif', fontSize: 15 },
  relatedStore: { color: colors.mid, fontSize: 11, marginTop: 2 },
  relatedPrice: { color: colors.gold, fontFamily: 'serif', fontSize: 15 },

  storeBanner: { flexDirection: 'row', gap: spacing.lg, padding: spacing.lg, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.goldLine },
  storeBannerName: { color: colors.white, fontFamily: 'serif', fontSize: 22, marginBottom: 4 },
  storeBannerMeta: { flexDirection: 'row', gap: spacing.lg, marginBottom: 8 },
  metaItem: { color: colors.mid, fontSize: 12 },
  storeBannerTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  cuisineTag: { borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: 8, paddingVertical: 3 },
  cuisineTagText: { color: colors.gold, fontSize: 10, letterSpacing: 1 },
  storeDescBox: { padding: spacing.lg, paddingBottom: 0 },
  storeDesc: { color: colors.mid, fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  storeItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm },
  storeItemsTitle: { color: colors.white, fontFamily: 'serif', fontSize: 20 },
  storeItemsCount: { color: colors.mid, fontSize: 12 },
  storeItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  storeItemEmoji: { fontSize: 26, width: 40, textAlign: 'center' },
  storeItemName: { color: colors.white, fontFamily: 'serif', fontSize: 15 },
  storeItemCat: { color: colors.mid, fontSize: 11 },
  storeItemPrice: { color: colors.gold, fontFamily: 'serif', fontSize: 16 },
  addBtnInline: { width: 30, height: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  addBtnInlineText: { color: colors.obsidian, fontSize: 18, fontWeight: '700' },

  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md, backgroundColor: colors.charcoal },
  cartTitle: { color: colors.white, fontFamily: 'serif', fontSize: 22 },
  cartEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cartEmptyIcon: { fontSize: 40, opacity: 0.2, marginBottom: 12, color: colors.gold },
  cartEmptyText: { color: colors.dim, fontSize: 16, fontStyle: 'italic' },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  cartItemIcon: { width: 48, height: 48, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cartItemName: { color: colors.white, fontFamily: 'serif', fontSize: 15 },
  cartItemCompany: { color: colors.mid, fontSize: 11, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 28, height: 28, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: colors.gold, fontSize: 16 },
  qtyNum: { color: colors.white, fontSize: 14, minWidth: 20, textAlign: 'center' },
  cartItemPrice: { color: colors.gold, fontFamily: 'serif', fontSize: 16, minWidth: 70, textAlign: 'right' },
  cartTotals: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.lg, marginTop: spacing.xl },
  cartTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cartTotalLabel: { color: colors.mid, fontSize: 13 },
  cartTotalVal: { color: colors.white, fontSize: 13 },
  cartGrandTotal: { color: colors.gold, fontFamily: 'serif', fontSize: 24 },
  checkoutBtn: { backgroundColor: colors.gold, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg },
  checkoutBtnText: { color: colors.obsidian, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },

  input: { backgroundColor: 'rgba(8,8,8,0.6)', borderWidth: 1, borderColor: colors.goldLine, color: colors.white, padding: spacing.md, fontSize: 14 },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: colors.goldLine },
  pillActive: { backgroundColor: colors.goldDim, borderColor: colors.gold },
  pillText: { color: colors.mid, fontSize: 12 },
  pillTextActive: { color: colors.gold },
});
