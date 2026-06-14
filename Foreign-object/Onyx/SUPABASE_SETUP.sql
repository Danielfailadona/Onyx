-- ═══════════════════════════════════════════════════════════
--  ONYX MARKETPLACE — Supabase Database Setup
--  Run this entire script in:
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text not null,
  email       text not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ═══════════════════════════════════════════════════════════
--  NOTE: Companies and menu items are stored in AsyncStorage
--  on the device for now (no backend persistence for those).
--  Only Auth + Profiles are managed by Supabase in this version.
--
--  To add full server-side company/menu storage, run the
--  optional tables below:
-- ═══════════════════════════════════════════════════════════

-- (Optional) COMPANIES table
-- create table if not exists public.companies (
--   id          uuid default gen_random_uuid() primary key,
--   owner_id    uuid references public.profiles(id) on delete cascade,
--   name        text not null unique,
--   owner       text,
--   email       text,
--   desc        text,
--   cuisines    text[],
--   created_at  timestamptz default now()
-- );
-- alter table public.companies enable row level security;

-- (Optional) MENU_ITEMS table
-- create table if not exists public.menu_items (
--   id           uuid default gen_random_uuid() primary key,
--   company_id   uuid references public.companies(id) on delete cascade,
--   name         text not null,
--   description  text,
--   price        numeric(10,2) not null,
--   category     text,
--   emoji        text,
--   tags         text[],
--   available    boolean default true,
--   created_at   timestamptz default now()
-- );
-- alter table public.menu_items enable row level security;
