import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/hooks/useStore';
import { useAuth } from '../src/hooks/useAuth';
import { colors, spacing, radius } from '../src/utils/theme';
import { GoldLine, EmptyState } from '../src/components/UI';

export default function CartScreen() {
  const router = useRouter();
  const { cart, cartTotal, changeCartQty, clearCart } = useStore();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);

  const subtotal = cartTotal;
  const service = subtotal * 0.1;
  const total = subtotal + service;

  function handleClear() {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    if (!profile?.phone || !profile?.address) {
      Alert.alert('Incomplete Profile', 'Please add personal info to continue', [
        { text: 'OK' },
      ]);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      router.back();
      setProcessing(false);
    }, 800);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Your Order</Text>
        </View>
        {cart.length > 0 ? (
          <Pressable onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : <View style={{ width: 50 }} />}
      </View>

      <GoldLine />

      {cart.length === 0 ? (
        <EmptyState icon="🛒" text="Your cart is empty." />
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 200 }}>
          {cart.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Text style={styles.cartEmoji}>{item.emoji}</Text>
              <View style={styles.cartInfo}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartCompany}>{item.companyName}</Text>
              </View>
              <Text style={styles.cartLineTotal}>₱{(item.price * item.qty).toLocaleString()}</Text>
              <View style={styles.qtyControls}>
                <Pressable onPress={() => changeCartQty(item.id, -1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <Pressable onPress={() => changeCartQty(item.id, 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <GoldLine style={{ marginVertical: spacing.md }} />

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₱{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service (10%)</Text>
              <Text style={styles.totalValue}>₱{service.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={styles.totalLabelFinal}>Total</Text>
              <Text style={styles.totalValueFinal}>₱{total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Pressable onPress={handleCheckout} disabled={processing} style={[styles.checkoutBtn, processing && styles.btnDisabled]}>
            <Text style={styles.checkoutText}>Place Order ✦</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  backText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, color: colors.white, fontFamily: 'serif', fontWeight: '700' },
  clearText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: spacing.lg },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  cartEmoji: { fontSize: 28, marginRight: spacing.sm },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 14, color: colors.white, fontWeight: '600' },
  cartCompany: { fontSize: 10, color: colors.mid, marginTop: 1 },
  cartLineTotal: { fontSize: 14, color: colors.gold, fontFamily: 'serif', fontWeight: '700', marginRight: spacing.md },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.goldLine },
  qtyBtnText: { fontSize: 16, color: colors.white, fontWeight: '700' },
  qtyValue: { fontSize: 15, color: colors.white, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  totals: { paddingBottom: spacing.lg },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  totalLabel: { fontSize: 13, color: colors.mid },
  totalValue: { fontSize: 13, color: colors.white },
  totalFinal: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.goldLine },
  totalLabelFinal: { fontSize: 15, color: colors.white, fontWeight: '700' },
  totalValueFinal: { fontSize: 18, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.goldLine, backgroundColor: colors.charcoal },
  checkoutBtn: { backgroundColor: colors.gold, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  checkoutText: { fontSize: 14, fontWeight: '700', color: colors.obsidian, letterSpacing: 2, textTransform: 'uppercase' },
  btnDisabled: { opacity: 0.5 },
});
