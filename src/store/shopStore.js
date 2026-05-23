import { create } from 'zustand'
import { readJson } from '../utils/seed'
import { shopsSeed } from '../utils/shopSeed'

const persistShops = (shops) => localStorage.setItem('barber-shops', JSON.stringify(shops))

export const useShopStore = create((set, get) => ({
  shops: readJson('barber-shops', shopsSeed),
  currentShop: null,
  registerShop: (payload) => {
    const shops = readJson('barber-shops', get().shops)
    if (shops.some((shop) => shop.slug === payload.slug)) throw new Error('Slug ja cadastrado')
    const shop = { id: `shop-${Date.now()}`, active: true, createdAt: new Date().toISOString(), ...payload }
    const next = [...shops, shop]
    persistShops(next)
    set({ shops: next, currentShop: shop })
    return shop
  },
  updateShop: (shopId, payload) => {
    const next = get().shops.map((shop) => (shop.id === shopId ? { ...shop, ...payload } : shop))
    persistShops(next)
    set({ shops: next })
  },
  getShopById: (id) => get().shops.find((shop) => shop.id === id),
  getShopBySlug: (slug) => get().shops.find((shop) => shop.slug === slug),
  searchShops: (query = '') => get().shops.filter((shop) => shop.active && shop.name.toLowerCase().includes(query.toLowerCase().trim())),
  setCurrentShop: (shopId) => set({ currentShop: get().shops.find((shop) => shop.id === shopId) || null }),
}))
