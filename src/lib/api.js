// Усі запити до Supabase зібрані тут. У компонентах і контексті
// викликаємо api-методи замість прямих звернень до supabase.

import { supabase, SUPABASE_READY } from './supabase';

// БД зберігає snake_case, компоненти очікують camelCase — мапери нижче
const mapProduct = (row) => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  brand: row.brand,
  type: row.type,
  lambda: Number(row.lambda),
  density: Number(row.density),
  vaporPerm: Number(row.vapor_perm),
  combustibility: row.combustibility,
  thicknessMm: row.thickness_mm,
  pricePerPack: row.price_per_pack,
  pricePerM3: row.price_per_m3,
  packM3: Number(row.pack_m3),
  packArea: Number(row.pack_area),
  stock: row.stock,
  rating: Number(row.rating),
  reviewsCount: row.reviews_count,
  image: row.image,
  description: row.description,
  suitable: row.suitable || [],
  isHit: row.is_hit,
});

const mapRegion = (row) => ({
  code: row.code,
  name: row.name,
  zone: row.zone,
  gsop: row.gsop,
  rWall: Number(row.r_wall),
  rRoof: Number(row.r_roof),
  rFloor: Number(row.r_floor),
  rFacade: Number(row.r_facade),
  rMansard: Number(row.r_mansard),
});

const mapWallMaterial = (row) => ({
  code: row.code,
  name: row.name,
  lambda: row.lambda !== null ? Number(row.lambda) : null,
  defaultMm: row.default_mm,
});

const mapProductType = (row) => ({
  id: row.id,
  name: row.name_ua,
  nameEn: row.name_en,
});

// ====================================================================
//  PRODUCTS
// ====================================================================
export const productsApi = {
  async list() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : null;
  },

  async create(p) {
    const payload = {
      sku: p.sku, name: p.name, brand: p.brand, type: p.type,
      lambda: p.lambda, density: p.density, vapor_perm: p.vaporPerm,
      combustibility: p.combustibility, thickness_mm: p.thicknessMm,
      price_per_pack: p.pricePerPack, price_per_m3: p.pricePerM3,
      pack_m3: p.packM3, pack_area: p.packArea,
      stock: p.stock, image: p.image, description: p.description,
      suitable: p.suitable, is_hit: p.isHit || false,
    };
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async update(id, patch) {
    const payload = {};
    if (patch.sku !== undefined) payload.sku = patch.sku;
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.brand !== undefined) payload.brand = patch.brand;
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.lambda !== undefined) payload.lambda = patch.lambda;
    if (patch.density !== undefined) payload.density = patch.density;
    if (patch.vaporPerm !== undefined) payload.vapor_perm = patch.vaporPerm;
    if (patch.combustibility !== undefined) payload.combustibility = patch.combustibility;
    if (patch.thicknessMm !== undefined) payload.thickness_mm = patch.thicknessMm;
    if (patch.pricePerPack !== undefined) payload.price_per_pack = patch.pricePerPack;
    if (patch.pricePerM3 !== undefined) payload.price_per_m3 = patch.pricePerM3;
    if (patch.packM3 !== undefined) payload.pack_m3 = patch.packM3;
    if (patch.packArea !== undefined) payload.pack_area = patch.packArea;
    if (patch.stock !== undefined) payload.stock = patch.stock;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.suitable !== undefined) payload.suitable = patch.suitable;
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async remove(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

// ====================================================================
//  ДОВІДНИКИ
// ====================================================================
export const refsApi = {
  async productTypes() {
    const { data, error } = await supabase.from('product_types').select('*');
    if (error) throw error;
    return (data || []).map(mapProductType);
  },
  async regions() {
    const { data, error } = await supabase.from('regions').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapRegion);
  },
  async wallMaterials() {
    const { data, error } = await supabase.from('wall_materials').select('*');
    if (error) throw error;
    return (data || []).map(mapWallMaterial);
  },
};

// ====================================================================
//  PROMOCODES
// ====================================================================
const mapPromo = (row) => ({
  code: row.code,
  type: row.type,
  value: row.value,
  minOrder: row.min_order,
  active: row.active,
  description: row.description,
  usedCount: row.used_count,
});

export const promocodesApi = {
  async list() {
    const { data, error } = await supabase.from('promocodes').select('*').order('code');
    if (error) throw error;
    return (data || []).map(mapPromo);
  },
  async create(p) {
    const payload = {
      code: p.code, type: p.type, value: p.value, min_order: p.minOrder,
      active: p.active, description: p.description, used_count: 0,
    };
    const { data, error } = await supabase.from('promocodes').insert(payload).select().single();
    if (error) throw error;
    return mapPromo(data);
  },
  async update(code, patch) {
    const payload = {};
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.value !== undefined) payload.value = patch.value;
    if (patch.minOrder !== undefined) payload.min_order = patch.minOrder;
    if (patch.active !== undefined) payload.active = patch.active;
    if (patch.description !== undefined) payload.description = patch.description;
    const { data, error } = await supabase.from('promocodes').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return mapPromo(data);
  },
  async remove(code) {
    const { error } = await supabase.from('promocodes').delete().eq('code', code);
    if (error) throw error;
  },
};

// ====================================================================
//  REVIEWS
// ====================================================================
const mapReview = (row) => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id,
  author: row.author,
  rating: row.rating,
  text: row.text,
  photos: row.photos || [],
  status: row.status,
  date: (row.created_at || '').slice(0, 10),
});

// RLS повертає: approved + власні + для адміна — усі
export const reviewsApi = {
  async list() {
    const { data, error } = await supabase
      .from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReview);
  },
  async create({ productId, userId, author, rating, text, photos = [] }) {
    const { data, error } = await supabase.from('reviews').insert({
      product_id: productId, user_id: userId,
      author, rating, text, photos, status: 'pending',
    }).select().single();
    if (error) throw error;
    return mapReview(data);
  },
  async moderate(id, status) {
    const { data, error } = await supabase
      .from('reviews').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return mapReview(data);
  },
};

// ====================================================================
//  ORDERS
// ====================================================================
const mapOrder = (row) => ({
  id: row.id,
  userId: row.user_id,
  customer: row.customer,
  email: row.email,
  phone: row.phone,
  total: row.total,
  status: row.status,
  payment: row.payment,
  date: (row.created_at || '').slice(0, 10),
  shipping: {
    type: row.shipping_type,
    city: row.shipping_city,
    branch: row.shipping_branch,
  },
  isB2B: row.is_b2b,
  company: row.company,
  edrpou: row.edrpou,
  comment: row.comment,
  items: (row.order_items || []).map((it) => ({
    productId: it.product_id, qty: it.qty, price: it.price,
  })),
});

export const ordersApi = {
  async list() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrder);
  },
  async create({ order, items }) {
    const orderPayload = {
      id: order.id,
      user_id: order.userId || null,
      customer: order.customer,
      email: order.email,
      phone: order.phone,
      total: order.total,
      status: order.status || 'new',
      payment: order.payment,
      shipping_type: order.shipping?.type,
      shipping_city: order.shipping?.city,
      shipping_branch: order.shipping?.branch,
      is_b2b: !!order.isB2B,
      company: order.company,
      edrpou: order.edrpou,
      comment: order.comment,
    };
    const { error: orderErr } = await supabase.from('orders').insert(orderPayload);
    if (orderErr) throw orderErr;

    const itemsPayload = items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      qty: it.qty,
      price: it.price,
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    return mapOrder({ ...orderPayload, created_at: new Date().toISOString(), order_items: itemsPayload });
  },
  async updateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
  },
};

// ====================================================================
//  WISHLIST
// ====================================================================
export const wishlistApi = {
  async list(userId) {
    const { data, error } = await supabase
      .from('wishlist').select('product_id').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((r) => r.product_id);
  },
  async add(userId, productId) {
    const { error } = await supabase
      .from('wishlist').insert({ user_id: userId, product_id: productId });
    if (error && error.code !== '23505') throw error;
  },
  async remove(userId, productId) {
    const { error } = await supabase
      .from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
    if (error) throw error;
  },
};

// ====================================================================
//  ADDRESSES
// ====================================================================
const mapAddress = (row) => ({
  id: row.id, label: row.label, city: row.city, branch: row.branch,
});

export const addressesApi = {
  async list(userId) {
    const { data, error } = await supabase
      .from('addresses').select('*').eq('user_id', userId).order('id');
    if (error) throw error;
    return (data || []).map(mapAddress);
  },
  async create(userId, { label, city, branch }) {
    const { data, error } = await supabase
      .from('addresses').insert({ user_id: userId, label, city, branch })
      .select().single();
    if (error) throw error;
    return mapAddress(data);
  },
  async remove(id) {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;
  },
};

// ====================================================================
//  СAVED CALCULATIONS
// ====================================================================
const mapCalc = (row) => ({
  id: row.id,
  objectType: row.object_type,
  objectTypeName: row.object_type_name,
  regionCode: row.region_code,
  regionName: row.region_name,
  area: Number(row.area),
  recommendedMm: row.recommended_mm,
  insulationId: row.insulation_id,
  insulationName: row.insulation_name,
  packs: row.packs,
  totalPrice: row.total_price,
  savedAt: row.saved_at,
});

export const calcSavesApi = {
  async list(userId) {
    const { data, error } = await supabase
      .from('calc_saves').select('*').eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCalc);
  },
  async create(userId, calc) {
    const payload = {
      user_id: userId,
      object_type: calc.objectType,
      object_type_name: calc.objectTypeName,
      region_code: calc.regionCode,
      region_name: calc.regionName,
      area: calc.area,
      recommended_mm: calc.recommendedMm,
      insulation_id: calc.insulationId,
      insulation_name: calc.insulationName,
      packs: calc.packs,
      total_price: calc.totalPrice,
    };
    const { data, error } = await supabase.from('calc_saves').insert(payload).select().single();
    if (error) throw error;
    return mapCalc(data);
  },
  async remove(id) {
    const { error } = await supabase.from('calc_saves').delete().eq('id', id);
    if (error) throw error;
  },
};

// ====================================================================
//  ADMIN LOGS
// ====================================================================
const mapLog = (row) => ({
  id: row.id,
  ts: (row.created_at || '').replace('T', ' ').slice(0, 16),
  admin: row.admin_email,
  action: row.action,
});

export const logsApi = {
  async list(limit = 200) {
    const { data, error } = await supabase
      .from('admin_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []).map(mapLog);
  },
  async add(adminEmail, action) {
    const { error } = await supabase
      .from('admin_logs').insert({ admin_email: adminEmail, action });
    if (error) throw error;
  },
};

export { SUPABASE_READY };
