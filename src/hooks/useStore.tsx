import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { DEMO_COMPANIES, DEMO_ITEMS, type Company, type MenuItem, type Order } from '../data/seed';

const SUPABASE_ENABLED = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  company: string;
  companyName: string;
  emoji: string;
}

interface StoreContextValue {
  loading: boolean;
  company: Company | null;
  menuItems: MenuItem[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  allCompanies: Company[];
  allItems: MenuItem[];
  registerCompany: (data: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (data: Partial<Company>) => Promise<void>;
  deleteCompany: () => Promise<void>;
  addItem: (data: Omit<MenuItem, 'id' | 'rating' | 'company' | 'companyName'> & { image_url?: string }) => Promise<void>;
  updateItem: (id: string, data: Partial<MenuItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addToCart: (item: MenuItem) => Promise<void>;
  changeCartQty: (id: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  orders: Order[];
  myOrders: Order[];
  placeOrder: (cartItems: CartItem[], profile: { id: string; full_name: string; phone: string | null; address: string | null; latitude: number | null; longitude: number | null }) => Promise<void>;
  fetchOrders: (companyId: string) => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  deleteMyOrders: (keys: { orderGroupId: string; companyId: string }[]) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function uid(): string {
  return 'u' + Date.now() + Math.random().toString(36).slice(2, 6);
}

function mapCompany(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner,
    email: row.email,
    cuisines: row.cuisines || [],
    description: row.description || '',
    rating: row.rating ?? 0,
    itemCount: row.item_count ?? 0,
  };
}

function mapItem(row: any, companies: Company[]): MenuItem {
  const c = companies.find(c => c.id === row.company_id);
  return {
    id: row.id,
    company: row.company_id,
    companyName: c?.name || 'Unknown',
    name: row.name,
    price: row.price,
    category: row.category,
    emoji: row.emoji,
    image_url: row.image_url || undefined,
    description: row.description || '',
    tags: row.tags || [],
    rating: row.rating ?? 0,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function setDemoData() {
    setAllCompanies(DEMO_COMPANIES);
    setAllItems(DEMO_ITEMS.map(i => ({ ...i, isDemo: true })));
    setCompany(null);
    setMenuItems([]);
    setCart([]);
  }

  async function fetchSupabaseData() {
    const sb = getSupabase()!;
    const { data: companyRows } = await sb.from('companies').select('*');
    const companies = (companyRows || []).map(mapCompany);
    setAllCompanies(companies);

    const { data: itemRows } = await sb.from('menu_items').select('*');
    const items = (itemRows || []).map(r => mapItem(r, companies));
    setAllItems(items);

    if (user) {
      const { data: myCompany } = await sb
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (myCompany) {
        const mapped = mapCompany(myCompany);
        setCompany(mapped);
        setMenuItems(items.filter(i => i.company === mapped.id));
      } else {
        setCompany(null);
        setMenuItems([]);
      }

          const { data: cartRows } = await sb
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      const mappedCart: CartItem[] = (cartRows || []).map(r => {
        const item = items.find(i => i.id === r.item_id);
        return {
          id: r.item_id,
          name: item?.name || 'Unknown',
          price: item?.price || 0,
          qty: r.qty,
          company: item?.company || '',
          companyName: item?.companyName || '',
          emoji: item?.emoji || '🍽',
        };
      });
      setCart(mappedCart);
    } else {
      setCompany(null);
      setMenuItems([]);
      setCart([]);
    }
  }

  async function fetchAsyncData() {
    const [c, i, cartData] = await Promise.all([
      AsyncStorage.getItem('@onyx_company'),
      AsyncStorage.getItem('@onyx_items'),
      AsyncStorage.getItem('@onyx_cart'),
    ]);
    const localCompany = c ? JSON.parse(c) : null;
    const localItems = i ? JSON.parse(i) : [];
    if (localCompany) setCompany(localCompany);
    if (localItems.length) setMenuItems(localItems);
    if (cartData) setCart(JSON.parse(cartData));
    const list = [...DEMO_COMPANIES];
    if (localCompany) list.unshift(localCompany);
    setAllCompanies(list);
    setAllItems([...localItems, ...DEMO_ITEMS.map(d => ({ ...d, isDemo: true }))]);
  }

  useEffect(() => {
    setLoading(true);
    if (SUPABASE_ENABLED) {
      fetchSupabaseData().catch(() => setDemoData()).finally(() => setLoading(false));
    } else {
      fetchAsyncData().catch(() => setDemoData()).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function refreshData() {
    if (SUPABASE_ENABLED) {
      await fetchSupabaseData().catch(() => setDemoData());
    } else {
      await fetchAsyncData().catch(() => setDemoData());
    }
  }

  async function registerCompany(data: Omit<Company, 'id'>) {
    if (SUPABASE_ENABLED) {
      if (!user) throw new Error('Must be signed in to register a company.');
      const sb = getSupabase()!;
      const { error } = await sb.from('companies').insert({
        user_id: user.id,
        name: data.name,
        owner: data.owner,
        email: data.email,
        cuisines: data.cuisines,
        description: data.description,
      });
      if (error) throw error;
      await refreshData();
    } else {
      const newCompany: Company = { id: uid(), ...data };
      await AsyncStorage.setItem('@onyx_company', JSON.stringify(newCompany));
      setCompany(newCompany);
      await refreshData();
    }
  }

  async function updateCompany(data: Partial<Company>) {
    if (SUPABASE_ENABLED) {
      if (!company) return;
      const sb = getSupabase()!;
      const { error } = await sb
        .from('companies')
        .update({
          name: data.name,
          owner: data.owner,
          email: data.email,
          description: data.description,
        })
        .eq('id', company.id);
      if (error) throw error;
      await refreshData();
    } else {
      if (!company) return;
      const updated = { ...company, ...data };
      await AsyncStorage.setItem('@onyx_company', JSON.stringify(updated));
      setCompany(updated);
      if (data.name) {
        const updatedItems = menuItems.map(item =>
          item.company === company.id ? { ...item, companyName: data.name! } : item
        );
        await AsyncStorage.setItem('@onyx_items', JSON.stringify(updatedItems));
        setMenuItems(updatedItems);
      }
    }
  }

  async function deleteCompany() {
    if (SUPABASE_ENABLED) {
      if (!company) return;
      const sb = getSupabase()!;
      const { error } = await sb
        .from('companies')
        .delete()
        .eq('id', company.id);
      if (error) throw error;
      await refreshData();
    } else {
      await AsyncStorage.multiRemove(['@onyx_company', '@onyx_items']);
      setCompany(null);
      setMenuItems([]);
    }
  }

  async function addItem(data: Omit<MenuItem, 'id' | 'rating' | 'company' | 'companyName'> & { image_url?: string }) {
    if (SUPABASE_ENABLED) {
      if (!company) return;
      const sb = getSupabase()!;
      const insertPayload: Record<string, any> = {
        company_id: company.id,
        name: data.name,
        price: data.price,
        category: data.category || 'Mains',
        emoji: data.emoji || '🍽',
        description: data.description || '',
        tags: data.tags || [],
        rating: +(4 + Math.random()).toFixed(1),
      };
      if (data.image_url) insertPayload.image_url = data.image_url;
      const { error } = await sb.from('menu_items').insert(insertPayload);
      if (error) throw error;
      await refreshData();
    } else {
      if (!company) return;
      const newItem: MenuItem = {
        id: uid(),
        company: company.id,
        companyName: company.name,
        rating: +(4 + Math.random()).toFixed(1),
        ...data,
      };
      const updated = [newItem, ...menuItems];
      await AsyncStorage.setItem('@onyx_items', JSON.stringify(updated));
      setMenuItems(updated);
    }
  }

  async function updateItem(id: string, data: Partial<MenuItem>) {
    if (SUPABASE_ENABLED) {
      const sb = getSupabase()!;
      const updatePayload: Record<string, any> = {
        name: data.name,
        price: data.price,
        category: data.category,
        emoji: data.emoji,
        description: data.description,
      };
      if (data.image_url) updatePayload.image_url = data.image_url;
      const { error } = await sb
        .from('menu_items')
        .update(updatePayload)
        .eq('id', id);
      if (error) throw error;
      await refreshData();
    } else {
      const updated = menuItems.map(item =>
        item.id === id ? { ...item, ...data } : item
      );
      await AsyncStorage.setItem('@onyx_items', JSON.stringify(updated));
      setMenuItems(updated);
    }
  }

  async function removeItem(id: string) {
    if (SUPABASE_ENABLED) {
      const sb = getSupabase()!;
      const { error } = await sb
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await refreshData();
    } else {
      const updated = menuItems.filter(item => item.id !== id);
      await AsyncStorage.setItem('@onyx_items', JSON.stringify(updated));
      setMenuItems(updated);
    }
  }

  async function addToCart(item: MenuItem) {
    if (SUPABASE_ENABLED) {
      if (!user) return;
      const sb = getSupabase()!;
      const { data: existing } = await sb
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .maybeSingle();
      if (existing) {
        await sb
          .from('cart_items')
          .update({ qty: existing.qty + 1 })
          .eq('id', existing.id);
      } else {
        await sb
          .from('cart_items')
          .insert({ user_id: user.id, item_id: item.id, qty: 1 });
      }
      await refreshData();
    } else {
      setCart(prev => {
        const existing = prev.find(c => c.id === item.id);
        const next = existing
          ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
          : [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, company: item.company, companyName: item.companyName, emoji: item.emoji }];
        AsyncStorage.setItem('@onyx_cart', JSON.stringify(next));
        return next;
      });
    }
  }

  async function changeCartQty(id: string, delta: number) {
    if (SUPABASE_ENABLED) {
      if (!user) return;
      const sb = getSupabase()!;
      const { data: existing } = await sb
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .maybeSingle();
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) {
          await sb.from('cart_items').delete().eq('id', existing.id);
        } else {
          await sb.from('cart_items').update({ qty: newQty }).eq('id', existing.id);
        }
      }
      await refreshData();
    } else {
      setCart(prev => {
        const next = prev.map(c =>
          c.id === id ? { ...c, qty: c.qty + delta } : c
        ).filter(c => c.qty > 0);
        AsyncStorage.setItem('@onyx_cart', JSON.stringify(next));
        return next;
      });
    }
  }

  async function clearCart() {
    if (SUPABASE_ENABLED) {
      if (!user) return;
      const sb = getSupabase()!;
      await sb.from('cart_items').delete().eq('user_id', user.id);
      setCart([]);
    } else {
      await AsyncStorage.setItem('@onyx_cart', JSON.stringify([]));
      setCart([]);
    }
  }

  async function placeOrder(cartItems: CartItem[], profile: { id: string; full_name: string; phone: string | null; address: string | null; latitude: number | null; longitude: number | null }) {
    if (cartItems.length === 0) return;
    const now = new Date().toISOString();
    const orderGroupId = 'grp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const newOrders: Order[] = cartItems.map(c => ({
      id: uid(),
      userId: profile.id,
      companyId: c.company,
      companyName: c.companyName,
      orderGroupId,
      itemId: c.id,
      itemName: c.name,
      itemPrice: c.price,
      qty: c.qty,
      userName: profile.full_name,
      userPhone: profile.phone || '',
      userAddress: profile.address || '',
      userLatitude: profile.latitude,
      userLongitude: profile.longitude,
      status: 'pending' as const,
      createdAt: now,
    }));

    if (SUPABASE_ENABLED) {
      const sb = getSupabase()!;
      const { error } = await sb.from('orders').insert(
        newOrders.map(o => ({
          user_id: o.userId,
          company_id: o.companyId,
          company_name: o.companyName,
          order_group_id: o.orderGroupId,
          item_id: o.itemId,
          item_name: o.itemName,
          item_price: o.itemPrice,
          qty: o.qty,
          user_name: o.userName,
          user_phone: o.userPhone,
          user_address: o.userAddress,
          user_latitude: o.userLatitude,
          user_longitude: o.userLongitude,
          status: o.status,
          created_at: o.createdAt,
        }))
      );
      if (error) throw error;
      await clearCart();
      await fetchMyOrders();
    } else {
      const existing = await AsyncStorage.getItem('@onyx_orders').then(d => d ? JSON.parse(d) : []);
      const merged = [...newOrders, ...existing];
      await AsyncStorage.setItem('@onyx_orders', JSON.stringify(merged));
      setOrders(prev => [...newOrders, ...prev]);
      setMyOrders(prev => [...newOrders, ...prev]);
      await clearCart();
    }
  }

  async function fetchOrders(companyId: string) {
    if (SUPABASE_ENABLED) {
      const sb = getSupabase()!;
      const { data } = await sb
        .from('orders')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (data) {
        setOrders(data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          companyId: r.company_id,
          companyName: r.company_name || '',
          orderGroupId: r.order_group_id || '',
          itemId: r.item_id,
          itemName: r.item_name,
          itemPrice: r.item_price,
          qty: r.qty,
          userName: r.user_name,
          userPhone: r.user_phone,
          userAddress: r.user_address,
          userLatitude: r.user_latitude,
          userLongitude: r.user_longitude,
          status: r.status,
          createdAt: r.created_at,
        })));
      }
    } else {
      const all = await AsyncStorage.getItem('@onyx_orders').then(d => d ? JSON.parse(d) : []);
      const filtered = all.filter((o: Order) => o.companyId === companyId);
      setOrders(filtered);
    }
  }

  async function fetchMyOrders() {
    if (SUPABASE_ENABLED) {
      if (!user) return;
      const sb = getSupabase()!;
      const { data } = await sb
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        setMyOrders(data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          companyId: r.company_id,
          companyName: r.company_name || '',
          orderGroupId: r.order_group_id || '',
          itemId: r.item_id,
          itemName: r.item_name,
          itemPrice: r.item_price,
          qty: r.qty,
          userName: r.user_name,
          userPhone: r.user_phone,
          userAddress: r.user_address,
          userLatitude: r.user_latitude,
          userLongitude: r.user_longitude,
          status: r.status,
          createdAt: r.created_at,
        })));
      }
    } else {
      const all = await AsyncStorage.getItem('@onyx_orders').then(d => d ? JSON.parse(d) : []);
      setMyOrders(all.filter((o: Order) => o.userId === user?.id));
    }
  }

  async function deleteMyOrders(keys: { orderGroupId: string; companyId: string }[]) {
    if (keys.length === 0) return;
    if (SUPABASE_ENABLED) {
      if (!user) return;
      const sb = getSupabase()!;
      for (const key of keys) {
        await sb
          .from('orders')
          .delete()
          .eq('order_group_id', key.orderGroupId)
          .eq('company_id', key.companyId)
          .eq('user_id', user.id);
      }
      await fetchMyOrders();
    } else {
      const all = await AsyncStorage.getItem('@onyx_orders').then(d => d ? JSON.parse(d) : []);
      const keysSet = new Set(keys.map(k => `${k.orderGroupId}_${k.companyId}`));
      const filtered = all.filter((o: Order) => !keysSet.has(`${o.orderGroupId}_${o.companyId}`));
      await AsyncStorage.setItem('@onyx_orders', JSON.stringify(filtered));
      setMyOrders(filtered);
    }
  }

  async function completeOrder(orderId: string) {
    if (SUPABASE_ENABLED) {
      const sb = getSupabase()!;
      await sb.from('orders').update({ status: 'completed' }).eq('id', orderId);
    } else {
      const all = await AsyncStorage.getItem('@onyx_orders').then(d => d ? JSON.parse(d) : []);
      const updated = all.map((o: Order) => o.id === orderId ? { ...o, status: 'completed' } : o);
      await AsyncStorage.setItem('@onyx_orders', JSON.stringify(updated));
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o));
    setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o));
  }

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        loading, company, menuItems, cart, cartCount, cartTotal,
        allCompanies, allItems,
        registerCompany, updateCompany, deleteCompany,
        addItem, updateItem, removeItem,
        addToCart, changeCartQty, clearCart,
        orders, myOrders, placeOrder, fetchOrders, fetchMyOrders, deleteMyOrders, completeOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
