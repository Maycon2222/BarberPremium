import { create } from 'zustand'

export const useToastStore = create((set, get) => ({
  toasts: [],
  notify: (toast) => {
    const id = `${Date.now()}-${Math.random()}`
    set({ toasts: [...get().toasts, { id, type: 'info', ...toast }] })
    setTimeout(() => set({ toasts: get().toasts.filter((item) => item.id !== id) }), 3600)
  },
}))
