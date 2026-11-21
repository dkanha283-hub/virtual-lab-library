-- ============================================================================
-- VIRTUAL LAB LIBRARY — SUPABASE POSTGRESQL SCHEMA
-- Paste this into Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. Departments Table
create table if not exists public.departments (
  id text primary key,
  slug text unique not null,
  code text not null,
  name text not null,
  short_name text not null,
  description text not null,
  icon_name text not null default 'Zap',
  accent_color text not null default 'teal',
  published boolean not null default true,
  created_at timestamptz default now()
);

-- 2. Laboratories Table
create table if not exists public.laboratories (
  id text primary key,
  slug text unique not null,
  code text not null,
  name text not null,
  department_id text references public.departments(id) on delete cascade,
  semester integer not null default 3,
  description text not null,
  incharge text not null default 'Prof. Lab In-Charge',
  room_number text not null default 'Academic Lab Complex',
  equipment_highlights jsonb not null default '[]'::jsonb,
  featured boolean not null default true,
  published boolean not null default true,
  created_at timestamptz default now()
);

-- 3. Experiments Table (Stores full 17-section experiment + customModelHtml & customSimulationHtml in payload JSONB)
create table if not exists public.experiments (
  id text primary key,
  slug text unique not null,
  code text not null,
  title text not null,
  lab_id text references public.laboratories(id) on delete cascade,
  department_id text references public.departments(id) on delete cascade,
  semester integer not null default 3,
  difficulty text not null default 'Intermediate',
  estimated_minutes integer not null default 120,
  published boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.departments enable row level security;
alter table public.laboratories enable row level security;
alter table public.experiments enable row level security;

-- Drop old policies if re-running script
drop policy if exists "Allow public read departments" on public.departments;
drop policy if exists "Allow public read laboratories" on public.laboratories;
drop policy if exists "Allow public read experiments" on public.experiments;
drop policy if exists "Allow authenticated or admin write departments" on public.departments;
drop policy if exists "Allow authenticated or admin write laboratories" on public.laboratories;
drop policy if exists "Allow authenticated or admin write experiments" on public.experiments;

-- Public Read Policies (Students & Visitors can read all published content + 3D HTML labs)
create policy "Allow public read departments"
  on public.departments for select using (true);

create policy "Allow public read laboratories"
  on public.laboratories for select using (true);

create policy "Allow public read experiments"
  on public.experiments for select using (true);

-- Write Policies (For strictest production security, create an Admin user in Supabase Auth
-- and replace `using (true)` below with `using (auth.role() = 'authenticated')`)
create policy "Allow authenticated or admin write departments"
  on public.departments for all using (true) with check (true);

create policy "Allow authenticated or admin write laboratories"
  on public.laboratories for all using (true) with check (true);

create policy "Allow authenticated or admin write experiments"
  on public.experiments for all using (true) with check (true);
