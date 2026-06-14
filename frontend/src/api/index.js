const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('glowora_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('glowora_token', token);
  else localStorage.removeItem('glowora_token');
}

/** Standard JSON fetch */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

/**
 * Multipart/FormData fetch (for file uploads).
 * Do NOT set Content-Type — browser sets it with boundary automatically.
 */
async function apiUpload(path, method, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, body: formData, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

/* ── Public ── */
export async function fetchCategories() { return apiFetch('/categories'); }
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/products${query ? `?${query}` : ''}`);
}
export async function fetchProduct(slug) { return apiFetch(`/products/${slug}`); }

/* ── Auth ── */
export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function register(name, email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}
export async function fetchMe() { return apiFetch('/auth/me'); }

/* ── User ── */
export async function fetchWishlist() { return apiFetch('/users/wishlist'); }
export async function addToWishlist(productId) {
  return apiFetch(`/users/wishlist/${productId}`, { method: 'POST' });
}
export async function removeFromWishlist(productId) {
  return apiFetch(`/users/wishlist/${productId}`, { method: 'DELETE' });
}

/* ── Orders ── */
export async function checkout(items, shippingAddress) {
  return apiFetch('/orders/checkout', { method: 'POST', body: JSON.stringify({ items, shippingAddress }) });
}
export async function demoPay(orderId) {
  return apiFetch(`/orders/demo-pay/${orderId}`, { method: 'POST' });
}
export async function fetchMyOrders() { return apiFetch('/orders/my'); }
export async function fetchOrder(id) { return apiFetch(`/orders/${id}`); }

/* ── Banner (public) ── */
export async function fetchBanner() { return apiFetch('/banner'); }

/* ── Admin: Analytics ── */
export async function fetchAdminAnalytics() { return apiFetch('/admin/analytics'); }

/* ── Admin: Banner ── */
export async function fetchAdminBanner() { return apiFetch('/admin/banner'); }

/**
 * Update banner — sends FormData so image files can be included.
 * @param {object} fields  — text fields { heading, subheading, … }
 * @param {File|null} heroImageFile  — optional new hero image File
 * @param {File|null} promoImageFile — optional new promo image File
 */
export async function updateAdminBanner(fields, heroImageFile, promoImageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (heroImageFile)  fd.append('image', heroImageFile);
  if (promoImageFile) fd.append('promoImage', promoImageFile);
  return apiUpload('/admin/banner', 'PUT', fd);
}

/* ── Admin: Orders ── */
export async function fetchAdminOrders() { return apiFetch('/admin/orders'); }
export async function approveOrder(id) {
  return apiFetch(`/admin/orders/${id}/approve`, { method: 'PATCH' });
}
export async function shipOrder(id) {
  return apiFetch(`/admin/orders/${id}/ship`, { method: 'PATCH' });
}

/* ── Admin: Products ── */
export async function fetchAdminProducts() { return apiFetch('/admin/products'); }
export async function fetchAdminCategories() { return apiFetch('/admin/categories'); }

export async function submitContact(fields) { return apiFetch('/contact', { method: 'POST', body: JSON.stringify(fields) }); }
export async function fetchAdminContacts() { return apiFetch('/admin/contacts'); }
export async function markContactRead(id) { return apiFetch(`/admin/contacts/${id}/read`, { method: 'PATCH' }); }
export async function deleteAdminContact(id) { return apiFetch(`/admin/contacts/${id}`, { method: 'DELETE' }); }

export async function createAdminCategory(fields, imageFile) {
  const fd = new FormData();
  if (fields.name) fd.append('name', fields.name);
  if (imageFile) fd.append('image', imageFile);
  return apiUpload('/admin/categories', 'POST', fd);
}

export async function updateAdminCategory(id, fields, imageFile) {
  const fd = new FormData();
  if (fields.name) fd.append('name', fields.name);
  if (imageFile) fd.append('image', imageFile);
  return apiUpload(`/admin/categories/${id}`, 'PUT', fd);
}

export async function deleteAdminCategory(id) {
  return apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
}

/**
 * Create product — sends FormData with required "image" file field.
 * @param {object} fields — product fields (name, price, etc.)
 * @param {File} imageFile — image file
 */
export async function createProduct(fields, imageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (imageFile) fd.append('image', imageFile);
  return apiUpload('/admin/products', 'POST', fd);
}

/**
 * Update product — sends FormData; image is optional.
 * @param {string} id
 * @param {object} fields
 * @param {File|null} imageFile
 */
export async function updateProduct(id, fields, imageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (imageFile) fd.append('image', imageFile);
  return apiUpload(`/admin/products/${id}`, 'PUT', fd);
}

export async function updateStock(id, stockQuantity) {
  return apiFetch(`/admin/products/${id}/stock`, {
    method: 'PATCH', body: JSON.stringify({ stockQuantity }),
  });
}
export async function updateDiscount(id, discountPercent) {
  return apiFetch(`/admin/products/${id}/discount`, {
    method: 'PATCH', body: JSON.stringify({ discountPercent }),
  });
}
export async function deleteProduct(id) {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

/* ── Helpers ── */
export function formatPrice(price) { return `$${Number(price).toFixed(2)}`; }
export function getProductPrice(product) { return product.finalPrice ?? product.price; }

export function getStatusLabel(status) {
  const labels = {
    pending_payment: 'Pending Payment',
    paid: 'Paid — Awaiting Approval',
    approved: 'Approved',
    shipped: 'Shipped',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    pending_payment: '#F59E0B',
    paid: '#3B82F6',
    approved: '#10B981',
    shipped: '#8B5CF6',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7C8D';
}
