// Глобальний стан застосунку: мова, кошик, порівняння, обране,
// авторизація, замовлення, відгуки, тости, логи адміна.

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { TRANSLATIONS } from '../data/i18n';
import { SEED_ORDERS, PROMOCODES_SEED, ADMIN_LOGS_SEED, VOLUME_DISCOUNTS } from '../data/orders';
import { SEED_REVIEWS } from '../data/reviews';
import { PRODUCTS as SEED_PRODUCTS, PRODUCT_TYPES as SEED_TYPES } from '../data/products';
import { REGIONS as SEED_REGIONS, WALL_MATERIALS as SEED_WALL_MATERIALS } from '../data/dbn';
import {
  productsApi, refsApi, promocodesApi, reviewsApi, ordersApi,
  wishlistApi, addressesApi, calcSavesApi, logsApi, SUPABASE_READY,
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { generateOrderId } from '../utils/format';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Максимальна кількість одиниць одного товару в кошику.
export const MAX_QTY = 99;

export function AppProvider({ children }) {
  /* ----------------------------- мова ----------------------------- */
  const [lang, setLang] = useState(() => storage.get('lang', 'ua'));
  useEffect(() => storage.set('lang', lang), [lang]);

  /* ----------------------- товари і довідники --------------------- */
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [productTypes, setProductTypes] = useState(SEED_TYPES);
  const [regions, setRegions] = useState(SEED_REGIONS);
  const [wallMaterials, setWallMaterials] = useState(SEED_WALL_MATERIALS);
  const [dataReady, setDataReady] = useState(!SUPABASE_READY);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, t, r, w] = await Promise.all([
          productsApi.list(),
          refsApi.productTypes(),
          refsApi.regions(),
          refsApi.wallMaterials(),
        ]);
        if (cancelled) return;
        if (p.length) setProducts(p);
        if (t.length) setProductTypes(t);
        if (r.length) setRegions(r);
        if (w.length) setWallMaterials(w);
      } catch (e) {
        console.error('[AppContext] load refs failed:', e);
      } finally {
        if (!cancelled) setDataReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getProduct = useCallback(
    (id) => products.find((p) => String(p.id) === String(id)) || null,
    [products]
  );

  const reloadProducts = useCallback(async () => {
    if (!SUPABASE_READY) return;
    try {
      const p = await productsApi.list();
      setProducts(p);
    } catch (e) { console.error(e); }
  }, []);
  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.ua[key] || key, [lang]);

  /* ----------------------------- кошик ---------------------------- */
  const [cart, setCart] = useState(() => storage.get('cart', []));
  useEffect(() => storage.set('cart', cart), [cart]);

  const addToCart = useCallback((productId, qty = 1, extra = {}) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(MAX_QTY, next[idx].qty + qty) };
        return next;
      }
      return [...prev, { productId, qty: Math.min(MAX_QTY, qty), ...extra }];
    });
    pushToast('Додано в кошик', 'success');
  }, []);

  const updateCartQty = (productId, qty) => {
    const clamped = Math.min(MAX_QTY, qty);
    setCart((prev) => prev.map((x) => x.productId === productId ? { ...x, qty: clamped } : x).filter((x) => x.qty > 0));
  };
  const removeFromCart = (productId) => setCart((prev) => prev.filter((x) => x.productId !== productId));
  const clearCart = () => setCart([]);

  /* ----- промокод + знижки ----- */
  const [promocode, setPromocode] = useState(null);
  const [promocodes, setPromocodes] = useState(PROMOCODES_SEED);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    promocodesApi.list().then(setPromocodes).catch(console.error);
  }, []);

  const reloadPromocodes = useCallback(async () => {
    if (!SUPABASE_READY) return;
    try { setPromocodes(await promocodesApi.list()); } catch (e) { console.error(e); }
  }, []);

  const cartTotals = useMemo(() => {
    const items = cart.map((c) => ({ ...c, product: getProduct(c.productId) })).filter((x) => x.product);
    const subtotal = items.reduce((s, x) => s + x.product.pricePerPack * x.qty, 0);
    const volumeM3 = items.reduce((s, x) => s + (x.product.packM3 || 0) * x.qty, 0);
    const tier = [...VOLUME_DISCOUNTS].reverse().find((v) => volumeM3 >= v.fromM3);
    const volumePct = tier?.percent || 0;
    const volumeDiscount = Math.round(subtotal * volumePct / 100);

    let promoDiscount = 0;
    let freeShipping = false;
    if (promocode && subtotal >= (promocode.minOrder || 0)) {
      if (promocode.type === 'percent') promoDiscount = Math.round(subtotal * promocode.value / 100);
      if (promocode.type === 'fixed')   promoDiscount = promocode.value;
      if (promocode.type === 'shipping') freeShipping = true;
    }
    const total = Math.max(0, subtotal - volumeDiscount - promoDiscount);
    return { items, subtotal, volumeM3, volumePct, volumeDiscount, promoDiscount, freeShipping, total, tier };
  }, [cart, promocode, getProduct]);

  const applyPromocode = useCallback((codeRaw) => {
    const code = (codeRaw || '').trim().toUpperCase();
    const found = promocodes.find((p) => p.code === code && p.active);
    if (!found) { pushToast('Промокод недійсний', 'error'); return false; }
    if (cartTotals.subtotal < found.minOrder) {
      pushToast(`Мінімальне замовлення для цього промокоду: ${found.minOrder} грн`, 'error');
      return false;
    }
    setPromocode(found);
    pushToast(`Промокод ${found.code} застосовано`, 'success');
    return true;
  }, [promocodes, cartTotals.subtotal]);

  /* --------------------------- порівняння ------------------------- */
  const [compare, setCompare] = useState(() => storage.get('compare', []));
  useEffect(() => storage.set('compare', compare), [compare]);
  const toggleCompare = (productId) => {
    setCompare((prev) => {
      if (prev.includes(productId)) return prev.filter((x) => x !== productId);
      if (prev.length >= 4) { pushToast('Можна порівнювати до 4 товарів', 'error'); return prev; }
      pushToast('Додано до порівняння', 'success');
      return [...prev, productId];
    });
  };
  const clearCompare = () => setCompare([]);

  /* ---------------------------- авторизація ----------------------- */
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  /* -------------------------- список бажань ----------------------- */
  // Гість — localStorage. Авторизований — повністю з БД, без merge.
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      if (!SUPABASE_READY) { setWishlist([]); return; }
      wishlistApi.list(user.id)
        .then((list) => { if (!cancelled) setWishlist(list); })
        .catch((e) => { console.error(e); if (!cancelled) setWishlist([]); });
    } else {
      setWishlist(storage.get('wishlist:guest', []));
    }
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) storage.set('wishlist:guest', wishlist);
  }, [wishlist, user]);

  const toggleWishlist = async (productId) => {
    const has = wishlist.includes(productId);
    setWishlist((prev) => has ? prev.filter((x) => x !== productId) : [...prev, productId]);
    pushToast(has ? 'Видалено з обраного' : 'Додано до обраного', has ? 'info' : 'success');
    if (SUPABASE_READY && user) {
      try {
        if (has) await wishlistApi.remove(user.id, productId);
        else await wishlistApi.add(user.id, productId);
      } catch (e) { console.error(e); }
    }
  };

  // RPC ensure_my_profile: повертає існуючий profile або створює новий.
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) { setUser(null); return null; }
    try {
      const { data, error } = await supabase.rpc('ensure_my_profile');
      if (error) {
        console.warn('[Auth] ensure_my_profile:', error.message);
        const { data: row } = await supabase
          .from('profiles').select('name, role, phone').eq('id', authUser.id).maybeSingle();
        const fresh = {
          id: authUser.id, email: authUser.email,
          name: row?.name || authUser.user_metadata?.name || authUser.email.split('@')[0],
          role: row?.role || 'user', phone: row?.phone,
        };
        setUser(fresh); return fresh;
      }
      const fresh = {
        id: authUser.id,
        email: data.email,
        name: data.name || authUser.user_metadata?.name || authUser.email.split('@')[0],
        role: data.role || 'user',
        phone: data.phone,
      };
      setUser(fresh);
      return fresh;
    } catch (e) {
      console.error('[Auth] loadProfile failed', e);
      setUser({ id: authUser.id, email: authUser.email, name: authUser.email, role: 'user' });
      return null;
    }
  }, []);

  useEffect(() => {
    if (!SUPABASE_READY) { setAuthReady(true); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) loadProfile(session.user).finally(() => setAuthReady(true));
      else setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) loadProfile(session.user);
      else setUser(null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      const msg = error.message.includes('Invalid login')
        ? 'Невірний email або пароль'
        : error.message.includes('Email not confirmed')
          ? 'Email не підтверджено. Перевірте пошту або вимкніть Confirm Email у Supabase.'
          : error.message;
      pushToast(msg, 'error');
      return { ok: false };
    }
    const profile = await loadProfile(data.user);
    pushToast(`Вітаємо, ${profile?.name || data.user.email}!`, 'success');
    return { ok: true, role: profile?.role || 'user' };
  };

  const register = async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name } },
    });
    if (error) { pushToast(error.message, 'error'); return { ok: false }; }
    if (!data.session) {
      pushToast('Перевірте пошту для підтвердження акаунту.', 'info');
      return { ok: true, pending: true };
    }
    const profile = await loadProfile(data.user);
    pushToast(`Вітаємо, ${profile?.name || name}!`, 'success');
    return { ok: true, role: profile?.role || 'user' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    pushToast('Ви вийшли з акаунту', 'info');
  };

  /* --------------------------- замовлення ------------------------- */
  const [orders, setOrders] = useState(SUPABASE_READY ? [] : SEED_ORDERS);

  const reloadOrders = useCallback(async () => {
    if (!SUPABASE_READY) return;
    try { setOrders(await ordersApi.list()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    if (user) reloadOrders();
    else setOrders([]);
  }, [user, reloadOrders]);

  const createOrder = async (orderData) => {
    if (!SUPABASE_READY) {
      setOrders((prev) => [orderData, ...prev]);
      return orderData;
    }
    try {
      await ordersApi.create({ order: orderData, items: orderData.items });
      await reloadOrders();
      return orderData;
    } catch (e) {
      pushToast(`Помилка збереження замовлення: ${e.message}`, 'error');
      throw e;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!SUPABASE_READY) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      return;
    }
    try {
      await ordersApi.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      addLog(`Змінено статус замовлення ${orderId} на «${status}»`);
    } catch (e) { pushToast(e.message, 'error'); }
  };

  /* ---------------- збережені розрахунки калькулятора ----------- */
  const [calcSaves, setCalcSaves] = useState([]);

  useEffect(() => {
    if (!SUPABASE_READY || !user) { setCalcSaves([]); return; }
    calcSavesApi.list(user.id).then(setCalcSaves).catch(console.error);
  }, [user]);

  const saveCalculation = async (calc) => {
    if (!SUPABASE_READY || !user) {
      pushToast('Увійдіть, щоб зберегти розрахунок', 'info');
      return;
    }
    try {
      const saved = await calcSavesApi.create(user.id, calc);
      setCalcSaves((prev) => [saved, ...prev]);
      pushToast('Розрахунок збережено в кабінеті', 'success');
    } catch (e) { pushToast(e.message, 'error'); }
  };

  const deleteCalculation = async (id) => {
    if (!SUPABASE_READY) {
      setCalcSaves((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    try {
      await calcSavesApi.remove(id);
      setCalcSaves((prev) => prev.filter((c) => c.id !== id));
    } catch (e) { pushToast(e.message, 'error'); }
  };

  /* ----------------------------- адреси --------------------------- */
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!SUPABASE_READY || !user) { setAddresses([]); return; }
    addressesApi.list(user.id).then(setAddresses).catch(console.error);
  }, [user]);

  const addAddress = async (a) => {
    if (!user) return;
    try {
      const created = await addressesApi.create(user.id, a);
      setAddresses((prev) => [...prev, created]);
    } catch (e) { pushToast(e.message, 'error'); }
  };

  const removeAddress = async (id) => {
    try {
      await addressesApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (e) { pushToast(e.message, 'error'); }
  };

  /* ----------------------------- відгуки -------------------------- */
  const [reviews, setReviews] = useState(SUPABASE_READY ? [] : SEED_REVIEWS);

  const reloadReviews = useCallback(async () => {
    if (!SUPABASE_READY) return;
    try { setReviews(await reviewsApi.list()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { reloadReviews(); }, [user, reloadReviews]);

  const addReview = async (r) => {
    if (!SUPABASE_READY) {
      setReviews((prev) => [{ ...r, id: 'r-' + Date.now(),
        date: new Date().toISOString().slice(0, 10), status: 'pending' }, ...prev]);
      pushToast('Дякуємо! Відгук відправлено на модерацію', 'success');
      return;
    }
    if (!user) {
      pushToast('Увійдіть, щоб залишити відгук', 'info');
      return;
    }
    try {
      const created = await reviewsApi.create({
        productId: r.productId, userId: user.id, author: r.author,
        rating: r.rating, text: r.text, photos: r.photos || [],
      });
      setReviews((prev) => [created, ...prev]);
      pushToast('Дякуємо! Відгук відправлено на модерацію', 'success');
    } catch (e) { pushToast(e.message, 'error'); }
  };

  const moderateReview = async (id, status) => {
    try {
      if (SUPABASE_READY) await reviewsApi.moderate(id, status);
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      addLog(`Відгук ${id} переведено у статус «${status}»`);
    } catch (e) { pushToast(e.message, 'error'); }
  };

  /* ----------------------------- логи ---------------------------- */
  const [logs, setLogs] = useState(SUPABASE_READY ? [] : ADMIN_LOGS_SEED);

  useEffect(() => {
    if (!SUPABASE_READY) return;
    if (user?.role === 'admin') logsApi.list().then(setLogs).catch(console.error);
    else setLogs([]);
  }, [user]);

  const addLog = useCallback(async (action) => {
    const entry = {
      id: Date.now(),
      ts: new Date().toISOString().replace('T', ' ').slice(0, 16),
      admin: user?.email || 'system',
      action,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 200));
    if (SUPABASE_READY && user?.role === 'admin') {
      try { await logsApi.add(user.email, action); } catch (e) { console.warn(e); }
    }
  }, [user]);

  /* ----------------------------- тости ---------------------------- */
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((message, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const value = {
    lang, setLang, t,
    products, setProducts, productTypes, regions, wallMaterials, getProduct, dataReady, reloadProducts,
    cart, addToCart, updateCartQty, removeFromCart, clearCart,
    cartTotals, promocode, setPromocode, applyPromocode,
    promocodes, setPromocodes,
    compare, toggleCompare, clearCompare,
    wishlist, toggleWishlist,
    user, authReady, login, register, logout,
    orders, createOrder, updateOrderStatus,
    calcSaves, saveCalculation, deleteCalculation,
    addresses, addAddress, removeAddress,
    reviews, addReview, moderateReview,
    logs, addLog,
    toasts, pushToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
