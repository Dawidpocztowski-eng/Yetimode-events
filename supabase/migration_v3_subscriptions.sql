-- Tabela subskrypcji / zakupów
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  plan text not null, -- 'starter' | 'wydarzenie' | 'premium'
  status text not null default 'pending', -- 'pending' | 'active' | 'expired'
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "user_own_subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id);

-- Dodaj kolumnę plan do events
alter table public.events add column if not exists plan text default 'free';

-- Widok: aktywny plan użytkownika
create or replace view public.user_active_plan as
select
  user_id,
  plan,
  expires_at,
  created_at
from public.subscriptions
where status = 'active'
  and (expires_at is null or expires_at > now())
order by created_at desc;
