-- Dodaj nowe kolumny do tabeli events

-- Widoczność strony od konkretnej daty
alter table public.events add column if not exists visible_from date default null;

-- Deadline RSVP
alter table public.events add column if not exists rsvp_deadline date default null;

-- Które sekcje są widoczne dla gości (JSON)
alter table public.events add column if not exists visible_sections jsonb default '{
  "countdown": true,
  "church": true,
  "venue": true,
  "description": true,
  "rsvp": true,
  "gallery": true,
  "photobooth": true,
  "schedule": true
}'::jsonb;

-- Plan dnia (tablica wydarzeń)
alter table public.events add column if not exists schedule jsonb default '[]'::jsonb;
