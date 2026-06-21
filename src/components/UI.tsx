import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, gradients, radius, spacing } from '../utils/theme';
import type { MenuItem } from '../data/seed';

const FALLBACK = require('../../assets/images/default_image.jpg');

export function GoldLine({ style }: { style?: ViewStyle }) {
  return <View style={[styles.goldLine, style]} />;
}

export function Eyebrow({ label }: { label: string }) {
  return <Text style={styles.eyebrow}>{label}</Text>;
}

interface BadgeProps {
  type: 'popular' | 'new' | 'verified' | 'danger';
  children: string;
}

export function Badge({ type, children }: BadgeProps) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    popular: { bg: colors.goldDim, border: colors.gold, text: colors.gold },
    new: { bg: 'rgba(108,63,197,0.18)', border: colors.purple, text: '#9a7ad0' },
    verified: { bg: 'rgba(74,158,114,0.18)', border: colors.success, text: colors.success },
    danger: { bg: 'rgba(184,64,64,0.18)', border: colors.danger, text: colors.danger },
  };
  const c = colorMap[type];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ icon = '🍽', text = 'Nothing here yet.' }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function StoreLogo({ name, index = 0, size = 48 }: { name: string; index?: number; size?: number }) {
  const gradient = gradients[index % gradients.length];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: gradient[0],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.4, fontWeight: '700', letterSpacing: 1 }}>
        {name.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

interface DishCardProps {
  item: MenuItem;
  onPress: () => void;
  onAdd: () => void;
  isWide?: boolean;
}

export function DishCard({ item, onPress, onAdd, isWide = false }: DishCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const imgSrc = item.image_url && !imgErr ? { uri: item.image_url } : FALLBACK;
  return (
    <Pressable onPress={onPress} style={[styles.card, isWide && { height: 330 }]}>
      <View style={styles.cardTopAccent} />
      <View style={[styles.cardImageArea, isWide && { height: 200 }]}>
        <Image
          source={imgSrc}
          onError={() => setImgErr(true)}
          style={[styles.cardImageFit, isWide && { resizeMode: 'contain' }]}
        />
        <View style={styles.cardOverlay} />
        <View style={styles.cardPricePill}>
          <Text style={styles.cardPriceText}>₱{item.price}</Text>
        </View>
        {item.tags.includes('new') && (
          <View style={styles.cardNewBadge}>
            <Badge type="new">NEW</Badge>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCompany}>{item.companyName}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardRating}>★ {item.rating.toFixed(1)}</Text>
          <Pressable onPress={onAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

interface DishListRowProps {
  item: MenuItem;
  onPress: () => void;
  onAdd: () => void;
}

export function DishListRow({ item, onPress, onAdd }: DishListRowProps) {
  const [imgErr, setImgErr] = useState(false);
  const imgSrc = item.image_url && !imgErr ? { uri: item.image_url } : FALLBACK;
  return (
    <Pressable onPress={onPress} style={styles.listRow}>
      <View style={styles.listEmojiBox}>
        <Image
          source={imgSrc}
          onError={() => setImgErr(true)}
          style={styles.listImageFit}
        />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.cardCompany}>{item.companyName}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.cardRating}>★ {item.rating.toFixed(1)}</Text>
      </View>
      <View style={styles.listRight}>
        <Text style={styles.cardPriceText}>₱{item.price}</Text>
        <Pressable onPress={onAdd} style={styles.listAddBtn}>
          <Text style={styles.listAddBtnText}>Add +</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  goldLine: { height: 1, backgroundColor: colors.goldLine },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', color: colors.gold },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 64, opacity: 0.2, marginBottom: spacing.md },
  emptyText: { fontSize: 13, color: colors.mid, fontStyle: 'italic' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.md, overflow: 'hidden', elevation: 2, zIndex: 1, width: '100%', height: 260 },
  cardTopAccent: { height: 2, backgroundColor: 'rgba(201,168,76,0.35)' },
  cardImageArea: { width: '100%', height: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.raised, position: 'relative' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardPricePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: colors.charcoal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  cardPriceText: { fontSize: 13, fontWeight: '700', color: colors.gold, fontFamily: 'serif' },
  cardNewBadge: { position: 'absolute', top: 8, left: 8 },
  cardBody: { padding: spacing.md },
  cardCompany: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.gold, marginBottom: 2 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.white, fontFamily: 'serif', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: colors.mid, lineHeight: 16, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardRating: { fontSize: 12, color: colors.gold },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 16, color: colors.obsidian, fontWeight: '700', lineHeight: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  cardImageFit: { width: '100%', height: '100%', resizeMode: 'cover' },
  listImageFit: { width: 64, height: 64, borderRadius: radius.md, resizeMode: 'cover' },
  listEmojiBox: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, overflow: 'hidden' },
  listInfo: { flex: 1, marginRight: spacing.sm },
  listRight: { alignItems: 'flex-end' },
  listAddBtn: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  listAddBtnText: { fontSize: 10, color: colors.gold, fontWeight: '600' },
});
