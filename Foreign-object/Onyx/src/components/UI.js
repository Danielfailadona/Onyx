import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, gradients } from '../utils/theme';
import { CAT_EMOJI } from '../data/seed';

// ── Gold divider ──
export function GoldLine({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.goldLine }, style]} />;
}

// ── Eyebrow label ──
export function Eyebrow({ children, style }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

// ── Badge ──
export function Badge({ type = 'popular', children }) {
  const s = { popular: styles.badgePopular, new: styles.badgeNew, verified: styles.badgeVerified, danger: styles.badgeDanger };
  return <View style={[styles.badge, s[type] || styles.badgePopular]}><Text style={[styles.badgeText, s[type] || styles.badgePopular]}>{children}</Text></View>;
}

// ── Empty state ──
export function EmptyState({ icon = '🍽', text = 'Nothing here yet.' }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ── Store logo avatar ──
export function StoreLogo({ name = '', index = 0, size = 48 }) {
  const [c1, c2] = gradients[index % gradients.length];
  return (
    <View style={[styles.storeLogo, { width: size, height: size, backgroundColor: c1 }]}>
      <Text style={[styles.storeLogoText, { fontSize: size * 0.32 }]}>{name.slice(0, 3).toUpperCase()}</Text>
    </View>
  );
}

// ── Dish card (grid) ──
export function DishCard({ item, onPress, onAdd }) {
  const emoji = item.emoji || CAT_EMOJI[item.category] || '🍽';
  const stars = Math.round(item.rating || 4);
  return (
    <TouchableOpacity style={styles.dishCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.dishCardTopAccent} />
      <View style={styles.dishCardImage}>
        <Text style={styles.dishCardEmoji}>{emoji}</Text>
        <View style={styles.dishCardImageOverlay} />
        <View style={styles.dishCardPricePill}>
          <Text style={styles.dishCardPrice}>₱{Number(item.price).toLocaleString()}</Text>
        </View>
        {item.tags?.includes('new') && (
          <View style={styles.dishCardNewBadge}><Text style={styles.dishCardNewText}>NEW</Text></View>
        )}
      </View>
      <View style={styles.dishCardBody}>
        <Text style={styles.dishCardStore} numberOfLines={1}>{item.companyName}</Text>
        <Text style={styles.dishCardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.dishCardDesc} numberOfLines={2}>{item.desc}</Text>
        <View style={styles.dishCardFooter}>
          <Text style={styles.dishCardStars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)} <Text style={styles.dishCardRating}>{Number(item.rating || 4).toFixed(1)}</Text></Text>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Dish list row ──
export function DishListRow({ item, onPress, onAdd }) {
  const emoji = item.emoji || CAT_EMOJI[item.category] || '🍽';
  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.listRowImage}><Text style={{ fontSize: 28 }}>{emoji}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listRowStore}>{item.companyName}</Text>
        <Text style={styles.listRowName}>{item.name}</Text>
        <Text style={styles.listRowDesc} numberOfLines={1}>{item.desc}</Text>
        <Text style={styles.listRowRating}>★ {Number(item.rating || 4).toFixed(1)}</Text>
      </View>
      <View style={styles.listRowRight}>
        <Text style={styles.listRowPrice}>₱{Number(item.price).toLocaleString()}</Text>
        <TouchableOpacity style={styles.addBtnSmall} onPress={onAdd}>
          <Text style={styles.addBtnSmallText}>Add +</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: 'sans-serif', fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.gold },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  badgePopular: { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: colors.goldLine, color: colors.gold },
  badgeNew:     { backgroundColor: 'rgba(108,63,197,0.3)',  borderColor: 'rgba(108,63,197,0.4)', color: '#a87ef5' },
  badgeVerified:{ backgroundColor: 'rgba(74,158,114,0.2)', borderColor: 'rgba(74,158,114,0.3)', color: colors.success },
  badgeDanger:  { backgroundColor: 'rgba(184,64,64,0.15)', borderColor: 'rgba(184,64,64,0.3)',  color: colors.danger },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyIcon: { fontSize: 40, opacity: 0.25, marginBottom: 12 },
  emptyText: { color: colors.dim, fontSize: 14, fontStyle: 'italic', textAlign: 'center' },

  storeLogo: { borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  storeLogoText: { fontWeight: '700', color: colors.obsidian },

  dishCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, overflow: 'hidden', flex: 1 },
  dishCardTopAccent: { height: 1, backgroundColor: colors.gold, opacity: 0.35 },
  dishCardImage: { height: 130, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dishCardEmoji: { fontSize: 48 },
  dishCardImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  dishCardPricePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(8,8,8,0.85)', borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: 8, paddingVertical: 3 },
  dishCardPrice: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  dishCardNewBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#6c3fc5', paddingHorizontal: 6, paddingVertical: 2 },
  dishCardNewText: { color: '#fff', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  dishCardBody: { padding: spacing.sm },
  dishCardStore: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 },
  dishCardName: { color: colors.white, fontSize: 14, fontFamily: 'serif', lineHeight: 18, marginBottom: 3 },
  dishCardDesc: { color: colors.mid, fontSize: 10, lineHeight: 14, marginBottom: 8 },
  dishCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dishCardStars: { color: colors.gold, fontSize: 10 },
  dishCardRating: { color: colors.mid },
  addBtn: { width: 28, height: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  addBtnText: { color: colors.obsidian, fontSize: 18, fontWeight: '700', lineHeight: 24 },

  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldLine, padding: spacing.md, marginBottom: 2 },
  listRowImage: { width: 64, height: 64, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  listRowStore: { color: colors.gold, fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  listRowName: { color: colors.white, fontSize: 15, fontFamily: 'serif', marginBottom: 2 },
  listRowDesc: { color: colors.mid, fontSize: 11, marginBottom: 4 },
  listRowRating: { color: colors.gold, fontSize: 10 },
  listRowRight: { alignItems: 'flex-end', gap: 6 },
  listRowPrice: { color: colors.gold, fontSize: 18, fontFamily: 'serif' },
  addBtnSmall: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm },
  addBtnSmallText: { color: colors.obsidian, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});
