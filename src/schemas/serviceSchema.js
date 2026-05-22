import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(3, 'Informe o nome do servico'),
  price: z.coerce.number().min(1, 'Preco deve ser maior que zero'),
  duration: z.coerce.number().min(15, 'Duracao minima de 15 minutos'),
  category: z.enum(['basic', 'combo', 'premium']),
})

export const serviceCategorySchema = z.object({
  name: z.string().min(3, 'Informe o nome da categoria'),
  description: z.string().optional().or(z.literal('')),
  required: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.coerce.number().min(0, 'Ordem deve ser positiva'),
})

export const serviceOptionSchema = z.object({
  name: z.string().min(3, 'Informe o nome da opcao'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  price: z.coerce.number().min(0, 'Preco nao pode ser negativo'),
  description: z.string().optional().or(z.literal('')),
  estimatedMinutes: z.coerce.number().min(0, 'Tempo nao pode ser negativo'),
  active: z.boolean().default(true),
  required: z.boolean().default(false),
  optionType: z.enum(['required', 'additional', 'combo']).default('additional'),
  order: z.coerce.number().min(0, 'Ordem deve ser positiva'),
  compatibility: z.object({
    incompatibleOptionIds: z.array(z.string()).default([]),
    requiresOptionIds: z.array(z.string()).default([]),
    notes: z.string().optional().or(z.literal('')),
  }).default({ incompatibleOptionIds: [], requiresOptionIds: [], notes: '' }),
})
