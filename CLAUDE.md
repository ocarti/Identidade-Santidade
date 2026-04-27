# CLAUDE.md — pure-identity-flow

Projeto do evento **Identidade Santidade 2026**: site institucional + e-commerce de ingressos e camisetas.

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Framer Motion 12** — usar `framer-motion`, não `motion/react`
- **React Router v6**
- **Supabase** (auth, banco PostgreSQL, Storage, Edge Functions)
- **Stripe** (pagamentos via Edge Function `create-ecommerce-checkout`)
- **Zod** + validações em `src/lib/validations.ts`

---

## Comandos

```bash
npm run dev        # servidor local
npm run build      # build de produção (pasta dist/)
npm run lint       # ESLint
```

Deploy: copiar `dist/` para o servidor de hospedagem.

---

## Estrutura de rotas (App.tsx)

| Rota | Página |
|---|---|
| `/` | Home (Index.tsx) |
| `/ecommerce` | Catálogo de produtos |
| `/ecommerce/produto/:id` | Detalhe do produto |
| `/ecommerce/carrinho` | Carrinho |
| `/ecommerce/checkout` | Checkout (requer login) |
| `/ecommerce/obrigado` | Confirmação de compra |
| `/ecommerce/login` | Login do cliente |
| `/ecommerce/cadastro` | Cadastro do cliente |
| `/ecommerce/recuperar-senha` | Recuperação de senha |
| `/ecommerce/nova-senha` | Redefinição de senha |
| `/ecommerce/conta` | Minha Conta (requer login) |
| `/ecommerce/conta/pedidos` | Meus Pedidos (requer login) |
| `/admin/login` | Login admin |
| `/admin` | Painel admin (requer role admin) |
| `/ingresso/transferir` | Transferência de ingresso |

Rotas `/sobre` e `/evento` foram removidas do projeto.

---

## Seções da Home (Index.tsx)

Ordem atual: `HeroSection` → `AboutSection` → `TestimonialsSection` → `GallerySection` → `EventDetailsSection` → `FAQSection` → `Footer` → `MarqueeBanner`

---

## Banco de dados (Supabase)

**Tabelas principais:**

| Tabela | Descrição |
|---|---|
| `customer_profiles` | Perfil do cliente (nome, email, cpf, telefone) — criado automaticamente via trigger `on_auth_user_created_customer` ao cadastrar |
| `customer_group_members` | Membros do grupo do cliente (user_id, nome) — CRUD na página Minha Conta |
| `orders` | Pedidos (user_id, total, status, stripe_session_id) |
| `order_items` | Itens do pedido (order_id, product_id, quantidade, preco_unitario) |
| `products` | Produtos da loja (nome, preco, imagem_url, estoque, ativo, tamanhos) |
| `registrations` | Inscrições no evento |
| `user_roles` | Roles: `admin`, `user`, `customer` |
| `expenses` | Controle financeiro interno |

**Enums:** `app_role` (admin/user/customer) · `order_status` (pendente/pago/cancelado/reembolsado) · `payment_status` (pendente/pago)

**RLS ativo** em todas as tabelas. Clientes só acessam seus próprios dados.

### SQL para tabela customer_group_members (ainda não aplicado se projeto novo):
```sql
CREATE TABLE customer_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE customer_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own group members"
ON customer_group_members FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Autenticação

- Contexto: `src/contexts/CustomerAuthContext.tsx`
- Exporta: `user`, `profile`, `loading`, `signUp`, `signIn`, `signOut`, `updateProfile`, `refreshProfile`
- **Confirmação de e-mail deve estar DESATIVADA** no Supabase (Authentication → Providers → Email → desmarcar "Confirm email")
- Após login, `fetchProfile` busca `customer_profiles` por `user_id`
- Logout limpa o carrinho do localStorage (`ecommerce_cart`)

---

## E-commerce

- **Carrinho:** estado via `CartContext` (localStorage `ecommerce_cart`)
- **Checkout:** Edge Function `create-ecommerce-checkout` (Stripe)
- **Imagens de produtos:** armazenadas no Supabase Storage, bucket `products`
  - URL padrão: `https://kvlyupiwtuztyzjmltzf.supabase.co/storage/v1/object/public/products/<arquivo>`
  - Para fazer upload com permissão: usar `service_role` key (não a `anon` key)
- **Tamanhos:** campo `tamanhos` (array de strings) na tabela `products`

---

## Edge Functions (supabase/functions/)

| Função | Descrição |
|---|---|
| `create-ecommerce-checkout` | Cria sessão Stripe para checkout |
| `verify-payment` | Verifica status do pagamento Stripe |
| `create-registration` | Registra participante no evento |
| `transfer-registration` | Transfere ingresso entre usuários |

---

## Componentes importantes

- `src/components/Header.tsx` — menu com "Loja" (botão primário), "Minha Conta"/"Entrar", "Sair" (só quando logado), carrinho
- `src/components/ecommerce/ProfileForm.tsx` — formulário controlado (sem estado interno); estado gerenciado pelo pai `Conta.tsx`
- `src/components/ecommerce/GroupSection.tsx` — CRUD de membros do grupo (nome)
- `src/contexts/CustomerAuthContext.tsx` — toda a lógica de auth do cliente
- `src/lib/validations.ts` — schemas Zod: `customerProfileSchema`, `customerSignUpSchema`, `customerLoginSchema`, `registrationSchema`

---

## Variáveis de ambiente (.env)

```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

A `service_role` key **não deve** ser commitada no `.env` — usá-la apenas em scripts locais ou Edge Functions.

---

## Convenções

- Idioma do projeto: **português brasileiro**
- Fontes: `font-display` (títulos) · `font-body` (textos)
- Estilo de botões primários: `bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-widest`
- Animações de entrada: `framer-motion` com `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}`
- HTTPS forçado via script no `index.html` (não depende de servidor)
- Sem página `/sobre` nem `/evento` — conteúdo migrado para a home
