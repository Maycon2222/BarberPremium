import { z } from 'zod'
import { PRODUCT_FULFILLMENT_METHOD_IDS, PRODUCT_RESERVATION_STATUS_IDS } from '../utils/pricing.js'

export const productCategorySchema = z.object({
  name: z.string().min(3, 'Informe o nome da categoria'),
  active: z.boolean().default(true),
  order: z.coerce.number().min(0, 'Ordem deve ser positiva'),
})

export const productSchema = z.object({
  name: z.string().min(3, 'Informe o nome do produto'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  price: z.coerce.number().min(0, 'Preco nao pode ser negativo'),
  stock: z.coerce.number().int().min(0, 'Estoque nao pode ser negativo'),
  active: z.boolean().default(true),
  description: z.string().optional().or(z.literal('')),
  pickupEnabled: z.boolean().default(true),
  deliveryEnabled: z.boolean().default(false),
  order: z.coerce.number().min(0, 'Ordem deve ser positiva'),
})

export const productReservationSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  appointmentId: z.string().optional().or(z.literal('')),
  clientId: z.string().min(1, 'Cliente obrigatorio'),
  quantity: z.coerce.number().int().min(1, 'Quantidade minima de 1'),
  fulfillmentMethod: z.enum(PRODUCT_FULFILLMENT_METHOD_IDS),
  status: z.enum(PRODUCT_RESERVATION_STATUS_IDS).default('reserved'),
})
