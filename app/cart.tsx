import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/hooks/useStore';
import { useAuth } from '../src/hooks/useAuth';
import { colors, spacing, radius } from '../src/utils/theme';
import { GoldLine, EmptyState } from '../src/components/UI';
import type { Order } from '../src/data/seed';

export default function CartScreen() {
  const router = useRouter();
  const { cart, cartTotal, changeCartQty, clearCart, placeOrder, myOrders, fetchMyOrders, deleteMyOrders } = useStore();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [activeCartView, setActiveCartView] = useState<'cart' | 'orders'>('cart');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [showOrderReceipt, setShowOrderReceipt] = useState(false);
  const [receiptGroup, setReceiptGroup] = useState<Order[]>([]);

  const subtotal = cartTotal;
  const service = subtotal * 0.1;
  const total = subtotal + service;

  const orderGroups = useMemo(() => {
    const groups: Record<string, { key: string; companyId: string; companyName: string; createdAt: string; items: Order[] }> = {};
    for (const o of myOrders) {
      const key = `${o.orderGroupId}_${o.companyId}`;
      if (!groups[key]) {
        groups[key] = { key, companyId: o.companyId, companyName: o.companyName, createdAt: o.createdAt, items: [] };
      }
      groups[key].items.push(o);
    }
    return Object.values(groups).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [myOrders]);

  useEffect(() => {
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCartView === 'orders') {
      fetchMyOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCartView]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marketplace');
    }
  }

  function handleClear() {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (!profile?.phone || !profile?.address) {
      Alert.alert('Incomplete Profile', 'Please add personal info to continue', [
        { text: 'OK' },
      ]);
      return;
    }
    setProcessing(true);
    try {
      await placeOrder(cart, profile);
      setReceiptItems([...cart]);
      setShowReceipt(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to place order.');
    }
    setProcessing(false);
  }

  function handleCloseReceipt() {
    setShowReceipt(false);
    setReceiptItems([]);
    clearCart();
    setActiveCartView('orders');
  }

  function getGroupTotal(items: Order[]) {
    const s = items.reduce((sum, i) => sum + i.itemPrice * i.qty, 0);
    return { subtotal: s, service: s * 0.1, total: s * 1.1 };
  }

  function toggleGroup(key: string) {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelectedGroups(new Set(orderGroups.map(g => g.key)));
  }

  function deselectAll() {
    setSelectedGroups(new Set());
  }

  async function handleDeleteSelected() {
    if (selectedGroups.size === 0) return;
    Alert.alert('Delete Orders', `Remove ${selectedGroups.size} order group(s)? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const keys = Array.from(selectedGroups).map(key => {
            const [orderGroupId, companyId] = key.split('_');
            return { orderGroupId, companyId };
          });
          await deleteMyOrders(keys);
          setSelectedGroups(new Set());
        },
      },
    ]);
  }

  function openReceipt(group: typeof orderGroups[number]) {
    setReceiptGroup(group.items);
    setShowOrderReceipt(true);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{activeCartView === 'cart' ? 'Your Order' : 'Placed Orders'}</Text>
        </View>
        {activeCartView === 'cart' && cart.length > 0 ? (
          <Pressable onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : activeCartView === 'orders' && orderGroups.length > 0 ? (
          selectedGroups.size > 0 ? (
            <Pressable onPress={deselectAll}>
              <Text style={styles.clearText}>Deselect</Text>
            </Pressable>
          ) : (
            <Pressable onPress={selectAll}>
              <Text style={styles.selectAllText}>Select All</Text>
            </Pressable>
          )
        ) : <View style={{ width: 50 }} />}
      </View>

      <GoldLine />

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveCartView('cart')}
          style={[styles.tab, activeCartView === 'cart' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeCartView === 'cart' && styles.tabTextActive]}>Cart</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveCartView('orders')}
          style={[styles.tab, activeCartView === 'orders' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeCartView === 'orders' && styles.tabTextActive]}>Placed Orders</Text>
        </Pressable>
      </View>

      <GoldLine />

      {activeCartView === 'cart' && (
        <>
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
                <Text style={styles.checkoutText}>{processing ? 'Processing...' : 'Place Order ✦'}</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {activeCartView === 'orders' && (
        <View style={{ flex: 1 }}>
          {orderGroups.length === 0 ? (
            <EmptyState icon="📦" text="No placed orders yet." />
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 120 }}>
              {orderGroups.map(group => {
                const total = getGroupTotal(group.items);
                const isSelected = selectedGroups.has(group.key);
                return (
                  <View key={group.key} style={[styles.orderGroup, isSelected && styles.orderGroupSelected]}>
                    <View style={styles.orderGroupHeader}>
                      <Pressable onPress={() => toggleGroup(group.key)} style={styles.checkRow}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderGroupCompany}>{group.companyName}</Text>
                        <Text style={styles.orderGroupDate}>{formatDate(group.createdAt)}</Text>
                      </View>
                      <Text style={styles.orderGroupStatus}>
                        {group.items.every(i => i.status === 'completed') ? '✅ Done' : '🟡 Pending'}
                      </Text>
                    </View>

                    {group.items.map((o, i) => (
                      <View key={o.id} style={styles.orderItemRow}>
                        <Text style={styles.orderItemQty}>{o.qty}×</Text>
                        <Text style={styles.orderItemName}>{o.itemName}</Text>
                        <Text style={styles.orderItemPrice}>₱{(o.itemPrice * o.qty).toLocaleString()}</Text>
                      </View>
                    ))}

                    <GoldLine style={{ marginVertical: spacing.sm }} />

                    <View style={styles.orderGroupTotal}>
                      <Text style={styles.orderGroupTotalLabel}>Total</Text>
                      <Text style={styles.orderGroupTotalValue}>₱{total.total.toFixed(2)}</Text>
                    </View>

                    <View style={styles.orderGroupActions}>
                      <Pressable onPress={() => openReceipt(group)} style={styles.receiptBtn}>
                        <Text style={styles.receiptBtnText}>View Receipt</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {selectedGroups.size > 0 && (
            <View style={styles.footer}>
              <Pressable onPress={handleDeleteSelected} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete Selected ({selectedGroups.size})</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <Modal visible={showReceipt} transparent animationType="fade" onRequestClose={handleCloseReceipt}>
        <ScrollView contentContainerStyle={styles.receiptOverlay}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>✦ Receipt ✦</Text>
            <GoldLine style={{ marginVertical: spacing.sm }} />

            {receiptItems.map((item, i) => (
              <View key={i} style={styles.receiptRow}>
                <Text style={styles.receiptQty}>{item.qty}×</Text>
                <Text style={styles.receiptName}>{item.name}</Text>
                <Text style={styles.receiptPrice}>₱{(item.price * item.qty).toLocaleString()}</Text>
              </View>
            ))}

            <GoldLine style={{ marginVertical: spacing.sm }} />

            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>Subtotal</Text>
              <Text style={styles.receiptTotalValue}>₱{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>Service (10%)</Text>
              <Text style={styles.receiptTotalValue}>₱{service.toFixed(2)}</Text>
            </View>
            <View style={[styles.receiptTotalRow, styles.receiptFinal]}>
              <Text style={styles.receiptFinalLabel}>Total</Text>
              <Text style={styles.receiptFinalValue}>₱{total.toFixed(2)}</Text>
            </View>

            {profile && (
              <>
                <GoldLine style={{ marginVertical: spacing.sm }} />
                <Text style={styles.receiptInfoLabel}>Deliver to</Text>
                <Text style={styles.receiptInfo}>{profile.full_name}</Text>
                <Text style={styles.receiptInfo}>{profile.phone}</Text>
                <Text style={styles.receiptInfo}>{profile.address}</Text>
              </>
            )}

            <GoldLine style={{ marginVertical: spacing.sm }} />
            <Text style={styles.receiptScreenshot}>📸 Please take a screenshot of your receipt</Text>

            {Platform.OS === 'web' && (
              <Pressable onPress={() => window.print()} style={styles.printBtn}>
                <Text style={styles.printBtnText}>🖨️ Print</Text>
              </Pressable>
            )}

            <Pressable onPress={handleCloseReceipt} style={styles.receiptCloseBtn}>
              <Text style={styles.receiptCloseText}>Close</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>

      <Modal visible={showOrderReceipt} transparent animationType="fade" onRequestClose={() => setShowOrderReceipt(false)}>
        <ScrollView contentContainerStyle={styles.receiptOverlay}>
          <View style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>✦ Receipt ✦</Text>
            {receiptGroup.length > 0 && (
              <Text style={styles.receiptCompany}>{receiptGroup[0].companyName}</Text>
            )}
            <GoldLine style={{ marginVertical: spacing.sm }} />

            {receiptGroup.map((o, i) => (
              <View key={i} style={styles.receiptRow}>
                <Text style={styles.receiptQty}>{o.qty}×</Text>
                <Text style={styles.receiptName}>{o.itemName}</Text>
                <Text style={styles.receiptPrice}>₱{(o.itemPrice * o.qty).toLocaleString()}</Text>
              </View>
            ))}

            <GoldLine style={{ marginVertical: spacing.sm }} />

            {(() => {
              const t = getGroupTotal(receiptGroup);
              return (
                <>
                  <View style={styles.receiptTotalRow}>
                    <Text style={styles.receiptTotalLabel}>Subtotal</Text>
                    <Text style={styles.receiptTotalValue}>₱{t.subtotal.toLocaleString()}</Text>
                  </View>
                  <View style={styles.receiptTotalRow}>
                    <Text style={styles.receiptTotalLabel}>Service (10%)</Text>
                    <Text style={styles.receiptTotalValue}>₱{t.service.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.receiptTotalRow, styles.receiptFinal]}>
                    <Text style={styles.receiptFinalLabel}>Total</Text>
                    <Text style={styles.receiptFinalValue}>₱{t.total.toFixed(2)}</Text>
                  </View>
                </>
              );
            })()}

            {receiptGroup.length > 0 && (
              <>
                <GoldLine style={{ marginVertical: spacing.sm }} />
                <Text style={styles.receiptInfoLabel}>Deliver to</Text>
                <Text style={styles.receiptInfo}>{receiptGroup[0].userName}</Text>
                <Text style={styles.receiptInfo}>{receiptGroup[0].userPhone}</Text>
                <Text style={styles.receiptInfo}>{receiptGroup[0].userAddress}</Text>
              </>
            )}

            <GoldLine style={{ marginVertical: spacing.sm }} />
            <Text style={styles.receiptScreenshot}>📸 Please take a screenshot of your receipt</Text>

            {Platform.OS === 'web' && (
              <Pressable onPress={() => window.print()} style={styles.printBtn}>
                <Text style={styles.printBtnText}>🖨️ Print</Text>
              </Pressable>
            )}

            <Pressable onPress={() => { setShowOrderReceipt(false); setReceiptGroup([]); }} style={styles.receiptCloseBtn}>
              <Text style={styles.receiptCloseText}>Close</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>
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
  selectAllText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { fontSize: 12, color: colors.mid, fontWeight: '600' },
  tabTextActive: { color: colors.obsidian },
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
  orderGroup: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.goldLine },
  orderGroupSelected: { borderColor: colors.gold },
  orderGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  checkRow: { padding: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkmark: { fontSize: 14, color: colors.obsidian, fontWeight: '700', lineHeight: 16 },
  orderGroupCompany: { fontSize: 15, color: colors.white, fontWeight: '600', fontFamily: 'serif' },
  orderGroupDate: { fontSize: 10, color: colors.mid, marginTop: 1 },
  orderGroupStatus: { fontSize: 11, fontWeight: '600' },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingLeft: spacing.xl },
  orderItemQty: { fontSize: 13, color: colors.white, fontWeight: '700', width: 28 },
  orderItemName: { flex: 1, fontSize: 13, color: colors.white },
  orderItemPrice: { fontSize: 13, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  orderGroupTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl },
  orderGroupTotalLabel: { fontSize: 13, color: colors.mid, fontWeight: '600' },
  orderGroupTotalValue: { fontSize: 15, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  orderGroupActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
  receiptBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.goldLine },
  receiptBtnText: { fontSize: 11, color: colors.gold, fontWeight: '600' },
  deleteBtn: { backgroundColor: colors.danger, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  receiptOverlay: { flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  receiptCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: colors.goldLine },
  receiptTitle: { fontSize: 20, color: colors.gold, fontFamily: 'serif', fontWeight: '700', textAlign: 'center' },
  receiptCompany: { fontSize: 14, color: colors.mid, textAlign: 'center', marginTop: spacing.xs },
  receiptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  receiptQty: { fontSize: 14, color: colors.white, fontWeight: '700', width: 32 },
  receiptName: { flex: 1, fontSize: 14, color: colors.white },
  receiptPrice: { fontSize: 14, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  receiptTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  receiptTotalLabel: { fontSize: 13, color: colors.mid },
  receiptTotalValue: { fontSize: 13, color: colors.white },
  receiptFinal: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.goldLine },
  receiptFinalLabel: { fontSize: 15, color: colors.white, fontWeight: '700' },
  receiptFinalValue: { fontSize: 18, color: colors.gold, fontFamily: 'serif', fontWeight: '700' },
  receiptInfoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: colors.gold, marginBottom: spacing.xs },
  receiptInfo: { fontSize: 13, color: colors.white, marginBottom: 2 },
  receiptScreenshot: { fontSize: 12, color: colors.mid, textAlign: 'center', fontStyle: 'italic' },
  printBtn: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center' },
  printBtnText: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  receiptCloseBtn: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: 'center' },
  receiptCloseText: { fontSize: 14, fontWeight: '700', color: colors.obsidian },
});