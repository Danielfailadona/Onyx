import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_COMPANIES, DEMO_ITEMS } from '../data/seed';

const StoreContext = createContext(null);

const KEYS = {
  company:   '@onyx_company',
  items:     '@onyx_items',
  cart:      '@onyx_cart',
};

function uid() { return 'u' + Date.now() + Math.random().toString(36).slice(2,6); }

export function StoreProvider({ children }) {
  const [company,   setCompany]   = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart,      setCart]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ── Load ──
  useEffect(() => {
    (async () => {
      try {
        const [c, m, ca] = await Promise.all([
          AsyncStorage.getItem(KEYS.company),
          AsyncStorage.getItem(KEYS.items),
          AsyncStorage.getItem(KEYS.cart),
        ]);
        if (c)  setCompany(JSON.parse(c));
        if (m)  setMenuItems(JSON.parse(m));
        if (ca) setCart(JSON.parse(ca));
      } catch (e) { console.warn(e); }
      setLoading(false);
    })();
  }, []);

  // ── Persist helpers ──
  const saveCompany   = useCallback(async (val) => { await AsyncStorage.setItem(KEYS.company, JSON.stringify(val)); }, []);
  const saveItems     = useCallback(async (val) => { await AsyncStorage.setItem(KEYS.items,   JSON.stringify(val)); }, []);
  const saveCart      = useCallback(async (val) => { await AsyncStorage.setItem(KEYS.cart,    JSON.stringify(val)); }, []);

  // ── Company ──
  const registerCompany = useCallback(async (data) => {
    const c = { id: uid(), ...data };
    setCompany(c);
    await saveCompany(c);
    return c;
  }, [saveCompany]);

  const updateCompany = useCallback(async (data) => {
    const updated = { ...company, ...data };
    // Also update companyName on owned items
    const updatedItems = menuItems.map(i => ({ ...i, companyName: updated.name }));
    setCompany(updated);
    setMenuItems(updatedItems);
    await saveCompany(updated);
    await saveItems(updatedItems);
  }, [company, menuItems, saveCompany, saveItems]);

  const deleteCompany = useCallback(async () => {
    setCompany(null);
    setMenuItems([]);
    await AsyncStorage.removeItem(KEYS.company);
    await AsyncStorage.setItem(KEYS.items, JSON.stringify([]));
  }, []);

  // ── Menu Items CRUD ──
  const addItem = useCallback(async (data) => {
    const item = {
      id: uid(),
      companyId:   company.id,
      companyName: company.name,
      rating:      parseFloat((4 + Math.random()).toFixed(1)),
      orders:      0,
      createdAt:   Date.now(),
      ...data,
    };
    const updated = [item, ...menuItems];
    setMenuItems(updated);
    await saveItems(updated);
    return item;
  }, [company, menuItems, saveItems]);

  const updateItem = useCallback(async (id, data) => {
    const updated = menuItems.map(i => i.id === id ? { ...i, ...data } : i);
    setMenuItems(updated);
    await saveItems(updated);
  }, [menuItems, saveItems]);

  const removeItem = useCallback(async (id) => {
    const updated = menuItems.filter(i => i.id !== id);
    setMenuItems(updated);
    await saveItems(updated);
  }, [menuItems, saveItems]);

  // ── Derived ──
  const getAllCompanies = useCallback(() => {
    return company ? [company, ...DEMO_COMPANIES] : [...DEMO_COMPANIES];
  }, [company]);

  const getAllItems = useCallback(() => {
    return [...menuItems, ...DEMO_ITEMS];
  }, [menuItems]);

  // ── Cart ──
  const addToCart = useCallback(async (item) => {
    const existing = cart.find(c => c.id === item.id);
    let updated;
    if (existing) {
      updated = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      updated = [...cart, { id: item.id, name: item.name, price: item.price, qty: 1, company: item.companyName, emoji: item.emoji || '🍽' }];
    }
    setCart(updated);
    await saveCart(updated);
  }, [cart, saveCart]);

  const changeCartQty = useCallback(async (id, delta) => {
    let updated = cart.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0);
    setCart(updated);
    await saveCart(updated);
  }, [cart, saveCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    await saveCart([]);
  }, [saveCart]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <StoreContext.Provider value={{
      loading, company, menuItems, cart, cartCount, cartTotal,
      registerCompany, updateCompany, deleteCompany,
      addItem, updateItem, removeItem,
      getAllCompanies, getAllItems,
      addToCart, changeCartQty, clearCart,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
