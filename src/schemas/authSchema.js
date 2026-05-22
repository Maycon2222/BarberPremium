import { z } from 'zod'
import { isPhoneBR } from '../utils/br'

export const loginSchema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  phone: z.string().refine(isPhoneBR, 'Telefone invalido'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao coincidem',
  path: ['confirmPassword'],
})
