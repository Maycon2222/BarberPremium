export const shopServicesSeed = [
  ['social', 'Corte Social', 'Acabamento classico para o dia a dia.', 30, 45],
  ['degrade', 'Corte Degrade', 'Fade alinhado com acabamento preciso.', 40, 55],
  ['corte-barba', 'Corte + Barba', 'Pacote completo para cabelo e barba.', 60, 85],
  ['barba', 'Barba Completa', 'Modelagem, toalha quente e finalizacao.', 30, 40],
  ['hidratacao', 'Hidratacao', 'Tratamento rapido para brilho e maciez.', 45, 60],
  ['sobrancelha', 'Sobrancelha', 'Design limpo com acabamento natural.', 15, 20],
]

export const shopsSeed = [
  {
    id: 'shop-kings',
    name: 'Barber Kings',
    slug: 'barber-kings',
    logo: null,
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1400&q=80',
    description: 'Barbearia premium com cortes modernos, agenda organizada e atendimento de alto padrao.',
    address: 'Rua das Flores, 42 - Centro',
    phone: '(11) 94444-1000',
    cnpj: '12345678000195',
    razaoSocial: 'Barber Kings Studio LTDA',
    verified: false,
    verifiedAt: null,
    active: true,
    createdAt: new Date().toISOString(),
    settings: { workingHours: { start: 8, end: 19 }, workingDays: [1, 2, 3, 4, 5, 6], slotInterval: 30, currency: 'BRL' },
    services: buildShopServices('shop-kings', 1),
  },
  {
    id: 'shop-navalha',
    name: 'Navalha & Arte',
    slug: 'navalha-arte',
    logo: null,
    coverImage: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=80',
    description: 'Tradicao, navalha e atendimento proximo para quem gosta de barbearia raiz.',
    address: 'Av. Brasil, 880 - Jardim',
    phone: '(11) 93333-2000',
    cnpj: '98765432000198',
    razaoSocial: 'Navalha e Arte Barbearia LTDA',
    verified: false,
    verifiedAt: null,
    active: true,
    createdAt: new Date().toISOString(),
    settings: { workingHours: { start: 9, end: 20 }, workingDays: [1, 2, 3, 4, 5, 6], slotInterval: 30, currency: 'BRL' },
    services: buildShopServices('shop-navalha', 0.9),
  },
]

function buildShopServices(shopId, multiplier) {
  return shopServicesSeed.map(([slug, name, description, estimatedMinutes, price]) => ({
    id: `${shopId}-${slug}`,
    shopId,
    name,
    description,
    estimatedMinutes,
    price: Math.round(price * multiplier),
    imageUrl: null,
    active: true,
  }))
}
