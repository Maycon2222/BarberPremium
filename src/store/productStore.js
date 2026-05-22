import { create } from 'zustand'
import { PRODUCT_CATEGORIES, PRODUCT_FULFILLMENT_METHODS, PRODUCTS, getProductReservationStatus, productSupportsFulfillment } from '../utils/pricing.js'
import { productReservationSchema } from '../schemas/productSchema.js'
import { readJson } from '../utils/seed.js'

const persistCategories = (categories) => localStorage.setItem('barber-product-categories', JSON.stringify(categories))
const persistProducts = (products) => localStorage.setItem('barber-products', JSON.stringify(products))
const persistReservations = (reservations) => localStorage.setItem('barber-product-reservations', JSON.stringify(reservations))

export const useProductStore = create((set, get) => ({
  categories: readJson('barber-product-categories', PRODUCT_CATEGORIES),
  products: readJson('barber-products', PRODUCTS),
  reservations: readJson('barber-product-reservations', []),
  fulfillmentMethods: readJson('barber-product-fulfillment-methods', PRODUCT_FULFILLMENT_METHODS),
  addCategory: (category) => {
    const next = [...get().categories, { id: `product-category-${Date.now()}`, active: true, order: get().categories.length * 10 + 10, ...category }]
    persistCategories(next)
    set({ categories: next })
  },
  updateCategory: (id, patch) => {
    const next = get().categories.map((category) => (category.id === id ? { ...category, ...patch } : category))
    persistCategories(next)
    set({ categories: next })
  },
  addProduct: (product) => {
    const next = [...get().products, { id: `product-${Date.now()}`, active: true, pickupEnabled: true, deliveryEnabled: false, order: get().products.length * 10 + 10, ...product }]
    persistProducts(next)
    set({ products: next })
  },
  updateProduct: (id, patch) => {
    const next = get().products.map((product) => (product.id === id ? { ...product, ...patch } : product))
    persistProducts(next)
    set({ products: next })
  },
  toggleProduct: (id) => {
    const next = get().products.map((product) => (product.id === id ? { ...product, active: !product.active } : product))
    persistProducts(next)
    set({ products: next })
  },
  reserveProduct: (reservation) => {
    const parsed = productReservationSchema.safeParse(reservation)
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Reserva invalida')
    const product = get().products.find((item) => item.id === parsed.data.productId)
    if (!product || !product.active) throw new Error('Produto indisponivel')
    if (!productSupportsFulfillment(product, parsed.data.fulfillmentMethod)) throw new Error('Forma de entrega indisponivel para este produto')
    if (Number(product.stock || 0) < parsed.data.quantity) throw new Error('Estoque insuficiente')
    const record = {
      id: `reservation-${Date.now()}`,
      createdAt: new Date().toISOString(),
      productName: product.name,
      unitPrice: Number(product.price || 0),
      totalPrice: Number(product.price || 0) * parsed.data.quantity,
      ...parsed.data,
    }
    const nextProducts = get().products.map((item) => (item.id === product.id ? { ...item, stock: Number(item.stock || 0) - parsed.data.quantity } : item))
    const next = [...get().reservations, record]
    persistProducts(nextProducts)
    persistReservations(next)
    set({ products: nextProducts, reservations: next })
    return record
  },
  updateReservation: (id, patch) => {
    const current = get().reservations.find((reservation) => reservation.id === id)
    if (!current) return
    const updated = { ...current, ...patch }
    const wasActiveStock = getProductReservationStatus(current.status || 'reserved')?.activeStock
    const isActiveStock = getProductReservationStatus(updated.status || 'reserved')?.activeStock
    let products = get().products
    if (wasActiveStock && !isActiveStock) {
      products = products.map((product) => (product.id === current.productId ? { ...product, stock: Number(product.stock || 0) + Number(current.quantity || 0) } : product))
    }
    if (!wasActiveStock && isActiveStock) {
      const product = products.find((item) => item.id === current.productId)
      if (!product || Number(product.stock || 0) < Number(current.quantity || 0)) throw new Error('Estoque insuficiente')
      products = products.map((item) => (item.id === current.productId ? { ...item, stock: Number(item.stock || 0) - Number(current.quantity || 0) } : item))
    }
    const next = get().reservations.map((reservation) => (reservation.id === id ? updated : reservation))
    persistProducts(products)
    persistReservations(next)
    set({ products, reservations: next })
  },
}))
