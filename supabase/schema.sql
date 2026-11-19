-- ============================================================================
-- VIRTUAL LAB LIBRARY — SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Paste this into Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. User Profiles & Role-Based Access Control
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text not null default 'student' check (role in ('public', 'student', 'instructor', 'admin')),
  assigned_department_id text,
  created_at timestamptz default now()
);

-- 2. Departments Table
create table if not exists public.departments (
  id text primary key,
  slug text unique not null,
  code text not null,
  name text not null,
  short_name text not null,
  description text not null,
  icon_name text not null default 'Cpu',
  accent_color text not null default 'sky',
  published boolean not null default true,
  created_at timestamptz default now()
);

-- 3. Laboratories Table
create table if not exists public.laboratories (
  id text primary key,
  slug text unique not null,
  code text not null,
  name text not null,
  department_id text references public.departments(id) on delete cascade,
  semester integer not null default 3,
  description text not null,
  incharge text not null default 'Prof. Lab In-Charge',
  room_number text not null default 'Block A - 101',
  published boolean not null default true,
  created_at timestamptz default now()
);

-- 4. Experiments Table (Supports JSONB configurable sections, 3D model config, and simulation config)
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
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.laboratories enable row level security;
alter table public.experiments enable row level security;

-- Public Read Policies for Published Content
create policy "Public can read published departments"
  on public.departments for select
  using (published = true or exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'admin')));

create policy "Public can read published laboratories"
  on public.laboratories for select
  using (published = true or exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'admin')));

create policy "Public can read published experiments"
  on public.experiments for select
  using (published = true or exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'admin')));

-- Admin Full Write Policies
create policy "Admins can manage departments"
  on public.departments for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage laboratories"
  on public.laboratories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'admin')));

create policy "Admins and Instructors can manage experiments"
  on public.experiments for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('instructor', 'admin')));
