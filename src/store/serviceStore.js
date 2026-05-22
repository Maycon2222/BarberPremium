import { create } from 'zustand'
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, SERVICE_OPTIONS, SERVICES } from '../utils/pricing'
import { readJson } from '../utils/seed'

const persist = (services) => localStorage.setItem('barber-services', JSON.stringify(services))
const persistCategories = (categories) => localStorage.setItem('barber-service-categories', JSON.stringify(categories))
const persistOptions = (options) => localStorage.setItem('barber-service-options', JSON.stringify(options))

export const useServiceStore = create((set, get) => ({
  services: readJson('barber-services', SERVICES),
  categories: readJson('barber-service-categories', SERVICE_CATEGORIES),
  options: readJson('barber-service-options', SERVICE_OPTIONS),
  productCategories: readJson('barber-product-categories', PRODUCT_CATEGORIES),
  addService: (service) => {
    const next = [...get().services, { id: `service-${Date.now()}`, ...service }]
    persist(next)
    set({ services: next })
  },
  updateService: (id, patch) => {
    const next = get().services.map((service) => (service.id === id ? { ...service, ...patch } : service))
    persist(next)
    set({ services: next })
  },
  removeService: (id) => {
    const next = get().services.filter((service) => service.id !== id)
    persist(next)
    set({ services: next })
  },
  addCategory: (category) => {
    const next = [...get().categories, { id: `category-${Date.now()}`, active: true, order: get().categories.length * 10 + 10, ...category }]
    persistCategories(next)
    set({ categories: next })
  },
  updateCategory: (id, patch) => {
    const next = get().categories.map((category) => (category.id === id ? { ...category, ...patch } : category))
    persistCategories(next)
    set({ categories: next })
  },
  toggleCategory: (id) => {
    const next = get().categories.map((category) => (category.id === id ? { ...category, active: !category.active } : category))
    persistCategories(next)
    set({ categories: next })
  },
  addOption: (option) => {
    const next = [
      ...get().options,
      {
        id: `option-${Date.now()}`,
        active: true,
        required: false,
        optionType: 'additional',
        order: get().options.filter((item) => item.categoryId === option.categoryId).length * 10 + 10,
        compatibility: { incompatibleOptionIds: [], requiresOptionIds: [], notes: '' },
        ...option,
      },
    ]
    persistOptions(next)
    set({ options: next })
  },
  updateOption: (id, patch) => {
    const next = get().options.map((option) => (option.id === id ? { ...option, ...patch } : option))
    persistOptions(next)
    set({ options: next })
  },
  toggleOption: (id) => {
    const next = get().options.map((option) => (option.id === id ? { ...option, active: !option.active } : option))
    persistOptions(next)
    set({ options: next })
  },
  removeOption: (id) => {
    const next = get().options.filter((option) => option.id !== id)
    persistOptions(next)
    set({ options: next })
  },
}))
