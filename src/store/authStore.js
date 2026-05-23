import { create } from 'zustand'
import { sanitizeDocument } from '../utils/documentValidation'
import { readJson } from '../utils/seed'

const persistUsers = (users) => localStorage.setItem('barber-users', JSON.stringify(users))
const safeSessionUser = (user) => {
  if (!user) return null
  const { password, confirmPassword, ...safeUser } = user
  return safeUser
}

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('barber-session') || 'null'),
  users: readJson('barber-users', []),
  login: ({ email, password }) => {
    const users = readJson('barber-users', get().users)
    const user = users.find((item) => item.email === email && item.password === password)
    if (!user) throw new Error('Credenciais invalidas')
    const sessionUser = safeSessionUser(user)
    localStorage.setItem('barber-session', JSON.stringify(sessionUser))
    set({ user: sessionUser, users })
    return sessionUser
  },
  register: (payload) => {
    const users = readJson('barber-users', get().users)
    if (users.some((item) => item.email === payload.email)) throw new Error('E-mail ja cadastrado')
    if (payload.cpf && users.some((item) => sanitizeDocument(item.cpf || '') === sanitizeDocument(payload.cpf))) throw new Error('Este CPF ja possui uma conta. Faca login.')
    if (payload.cnpj && users.some((item) => sanitizeDocument(item.cnpj || '') === sanitizeDocument(payload.cnpj))) throw new Error('Este CNPJ ja possui uma conta cadastrada.')
    const { confirmPassword, role: requestedRole = 'client', ...account } = payload
    const role = ['barber', 'owner'].includes(requestedRole) ? requestedRole : 'client'
    const user = { id: `${role}-${Date.now()}`, role, ...account }
    const next = [...users, user]
    persistUsers(next)
    const sessionUser = safeSessionUser(user)
    localStorage.setItem('barber-session', JSON.stringify(sessionUser))
    set({ users: next, user: sessionUser })
    return sessionUser
  },
  updateProfile: (payload) => {
    const current = get().user
    if (!current) throw new Error('Sessao expirada')
    const users = readJson('barber-users', get().users)
    const nextUser = safeSessionUser({ ...current, ...payload })
    const nextUsers = users.map((item) => (item.id === current.id ? { ...item, ...payload } : item))
    persistUsers(nextUsers)
    localStorage.setItem('barber-session', JSON.stringify(nextUser))
    set({ users: nextUsers, user: nextUser })
    return nextUser
  },
  logout: () => {
    localStorage.removeItem('barber-session')
    set({ user: null })
  },
}))
