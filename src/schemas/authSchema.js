import { z } from 'zod'
import { isPhoneBR } from '../utils/br'
import { hasFullName, isAdultBirthDate, sanitizeDocument, validateCPF } from '../utils/documentValidation'

export const loginSchema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  phone: z.string().refine(isPhoneBR, 'Telefone invalido'),
  role: z.enum(['client']).default('client'),
  cpf: z.string().optional(),
  fullName: z.string().optional(),
  birthDate: z.string().optional(),
  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Senhas nao coincidem', path: ['confirmPassword'] })
  }

  if (data.role === 'client') {
    if (!validateCPF(sanitizeDocument(data.cpf || '')).valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF invalido. Verifique os numeros.', path: ['cpf'] })
    }
    if (!data.fullName || !hasFullName(data.fullName)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe nome e sobrenome', path: ['fullName'] })
    }
    if (!data.birthDate || !isAdultBirthDate(data.birthDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data invalida ou idade menor que 18 anos', path: ['birthDate'] })
    }
  }

})
