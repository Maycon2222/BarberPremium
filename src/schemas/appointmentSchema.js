import { z } from 'zod'
import { isAtLeastOneHourAhead, isWorkingDay } from '../utils/businessRules'
import { isPhoneBR } from '../utils/br'
import { PAYMENT_METHOD_IDS } from '../utils/pricing'

export const appointmentSchema = z.object({
  clientName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  clientPhone: z.string().refine(isPhoneBR, 'Telefone invalido. Use (XX) XXXXX-XXXX'),
  clientEmail: z.string().email('E-mail invalido').optional().or(z.literal('')),
  serviceId: z.string().optional().or(z.literal('')),
  selectedServiceIds: z.array(z.string()).min(1, 'Selecione ao menos um servico'),
  selectedOptionIds: z.array(z.string()).optional().default([]),
  shopId: z.string({ required_error: 'Selecione uma barbearia' }).min(1, 'Selecione uma barbearia'),
  barberId: z.string({ required_error: 'Selecione um barbeiro' }).min(1, 'Selecione um barbeiro'),
  date: z.string().refine((value) => {
    const selected = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selected >= today
  }, 'Data nao pode ser no passado').refine(isWorkingDay, 'Atendemos de segunda a sabado'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horario invalido'),
  paymentMethod: z.enum(PAYMENT_METHOD_IDS, { required_error: 'Selecione uma forma de pagamento' }),
}).refine((data) => isAtLeastOneHourAhead(data.date, data.time), {
  message: 'Agendamento precisa ter pelo menos 1h de antecedencia',
  path: ['time'],
})
