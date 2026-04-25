-- Włącz UUID
create extension if not exists "uuid-ossp";

-- EVENTS
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  type text not null default 'wedding',
  title text not null,
  date date not null,
  time text,
  venue_name text,
  venue_city text,
  description text,
  cover_url text,
  primary_color text default '#0ea5e9',
  gallery_code text not null default 'EVENT2027',
  is_published boolean default false,
  partner1_name text,
  partner2_name text,
  church_name text,
  church_time text,
  created_at timestamptz default now()
);

-- GUESTS
create table public.guests (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  group_type text default 'family',
  confirmed boolean default false,
  companion_name text,
  children jsonb default '[]',
  notes text,
  created_at timestamptz default now()
);

-- BUDGET
create table public.budget_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  category text not null,
  total_cost numeric default 0,
  deposits jsonb default '[]',
  paid boolean default false,
  note text,
  created_at timestamptz default now()
);

-- TABLES
create table public.event_tables (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  shape text default 'round',
  capacity integer default 8,
  seats jsonb default '[]',
  created_at timestamptz default now()
);

-- RSVP
create table public.rsvp_entries (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  attending boolean default true,
  guests_count integer default 1,
  accommodation boolean default false,
  transport boolean default false,
  dietary_needs text,
  notes text,
  created_at timestamptz default now()
);

-- GALLERY
create table public.gallery_photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  storage_path text not null,
  url text not null,
  frame text default 'none',
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.budget_items enable row level security;
alter table public.event_tables enable row level security;
alter table public.rsvp_entries enable row level security;
alter table public.gallery_photos enable row level security;

-- Polityki: właściciel widzi swoje dane
create policy "owner_all_events" on public.events for all using (auth.uid() = user_id);

create policy "owner_all_guests" on public.guests for all
  using (event_id in (select id from public.events where user_id = auth.uid()));

create policy "owner_all_budget" on public.budget_items for all
  using (event_id in (select id from public.events where user_id = auth.uid()));

create policy "owner_all_tables" on public.event_tables for all
  using (event_id in (select id from public.events where user_id = auth.uid()));

create policy "owner_all_rsvp" on public.rsvp_entries for all
  using (event_id in (select id from public.events where user_id = auth.uid()));

create policy "owner_all_gallery" on public.gallery_photos for all
  using (event_id in (select id from public.events where user_id = auth.uid()));

-- Goście mogą dodawać RSVP do opublikowanych wydarzeń
create policy "public_insert_rsvp" on public.rsvp_entries for insert
  with check (event_id in (select id from public.events where is_published = true));

-- Goście mogą czytać opublikowane wydarzenia
create policy "public_read_events" on public.events for select
  using (is_published = true or auth.uid() = user_id);

-- Goście mogą dodawać zdjęcia do galerii opublikowanych wydarzeń
create policy "public_insert_gallery" on public.gallery_photos for insert
  with check (event_id in (select id from public.events where is_published = true));

-- Goście mogą czytać galerię opublikowanych wydarzeń
create policy "public_read_gallery" on public.gallery_photos for select
  using (event_id in (select id from public.events where is_published = true));

-- Storage bucket na zdjęcia
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);

create policy "public_upload_gallery" on storage.objects for insert
  with check (bucket_id = 'gallery');

create policy "public_read_gallery_storage" on storage.objects for select
  using (bucket_id = 'gallery');

create policy "owner_delete_gallery" on storage.objects for delete
  using (bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]);
