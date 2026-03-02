-- ==========================================
-- SCRIPT DE ESQUEMA DO FIBRALTEX (SUPABASE)
-- Cole este script no "SQL Editor" do seu Supabase e clique em "Run".
-- ==========================================

-- 1. Criação das tabelas
create table if not exists company_info (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  name text,
  cnpj text,
  address text,
  phone text,
  email text,
  logo text
);

create table if not exists user_profile (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  name text,
  email text,
  role text,
  photo text
);

create table if not exists supplies (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  name text not null,
  quantity numeric default 0,
  unit text default 'peças',
  min_stock numeric default 0,
  initial_quantity numeric default 0
);

create table if not exists products (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  code text,
  name text not null,
  description text,
  unit_cost numeric default 0,
  color text,
  photo text
);

create table if not exists operations (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  code text,
  description text not null,
  status text default 'Aguardando'
);

create table if not exists team (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  name text not null,
  role text not null,
  avatar text
);

create table if not exists production_orders (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  code text,
  product_id bigint references products(id) on delete cascade,
  quantity integer not null,
  entry_date text,
  delivery_date text,
  priority text default 'Média',
  status text default 'Planejado'
);

create table if not exists production_logs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  order_id bigint references production_orders(id) on delete cascade,
  operator_id bigint references team(id) on delete cascade,
  operation_id bigint references operations(id) on delete cascade,
  start_time text,
  end_time text,
  status text default 'Aguardando'
);

-- 2. Configurar a Segurança (Row Level Security - RLS)
-- Isso garante que os usuários só consigam ver e alterar os seus próprios dados.

alter table company_info enable row level security;
alter table user_profile enable row level security;
alter table supplies enable row level security;
alter table products enable row level security;
alter table operations enable row level security;
alter table team enable row level security;
alter table production_orders enable row level security;
alter table production_logs enable row level security;

-- Políticas de Acesso
drop policy if exists "Acesso proprietario company_info" on company_info;
create policy "Acesso proprietario company_info" on company_info for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario user_profile" on user_profile;
create policy "Acesso proprietario user_profile" on user_profile for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario supplies" on supplies;
create policy "Acesso proprietario supplies" on supplies for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario products" on products;
create policy "Acesso proprietario products" on products for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario operations" on operations;
create policy "Acesso proprietario operations" on operations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario team" on team;
create policy "Acesso proprietario team" on team for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario production_orders" on production_orders;
create policy "Acesso proprietario production_orders" on production_orders for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Acesso proprietario production_logs" on production_logs;
create policy "Acesso proprietario production_logs" on production_logs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FIM! 🚀 Sua base de dados está pronta para ser usada pela Vercel.
