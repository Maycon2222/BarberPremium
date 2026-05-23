# Barber Prime SaaS

SaaS de barbearia em React + Tailwind com tres areas: Cliente, Barbeiro e Admin.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run check:rules
```

`npm run check:rules` valida regras criticas de precificacao dinamica, compatibilidade, calculo de tempo/valor, metricas financeiras e migracao de dados.

## Verificacao de identidade

O cadastro valida CPF/CNPJ localmente com digitos verificadores. Para verificacao externa de CPF via Serpro DataValid, configure:

```env
VITE_SERPRO_TOKEN=seu_token_aqui
```

Sem esse token, o cadastro de cliente continua funcionando e salva `verified: false` para revisao. CNPJ de barbeiro usa consulta ReceitaWS quando disponivel.

## Precificacao dinamica

Os servicos nao dependem mais apenas de uma lista fixa. A base fica em:

- `src/utils/pricing.js`: categorias, opcoes, produtos e helpers de calculo.
- `src/store/serviceStore.js`: CRUD local de categorias e opcoes.
- `src/pages/admin/AdminServices.jsx`: tela de gestao para Admin e Barbeiro.
- `src/pages/client/BookingWizard.jsx`: wizard do cliente com selecao por categoria.

Cada opcao pode ter nome, categoria, preco, descricao, tempo estimado, status ativo/inativo, tipo obrigatorio/adicional/combo, ordem e compatibilidade.

## Compatibilidade

As regras ficam no campo `compatibility` de cada opcao:

- `incompatibleOptionIds`: bloqueia opcoes que nao combinam.
- `requiresOptionIds`: exige opcoes complementares.
- `notes`: observacao operacional.

O wizard bloqueia opcoes incompatíveis e exibe o motivo.

## Produtos

O modulo de produtos esta preparado, mas a loja do cliente ainda nao foi implementada.

- `src/store/productStore.js`: produtos, categorias e reservas.
- `src/schemas/productSchema.js`: validacao de produto/categoria/reserva.
- `src/pages/admin/AdminProducts.jsx`: catalogo interno de estoque.

Produtos ja suportam retirada no dia do corte e entrega futura.

## Dados locais

A persistencia usa `localStorage`. O seed e as migracoes ficam em `src/utils/seed.js`.

A migracao faz merge por `id`, preservando edicoes locais como nome, preco, ordem e status, e adicionando novas opcoes/categorias/produtos seedados.
