-- dAite Database Schema
-- Run this in Supabase SQL Editor

-- Enable pgvector for semantic matching
create extension if not exists vector;

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  age integer,
  gender text,
  orientation text,
  age_range_min integer default 18,
  age_range_max integer default 40,
  match_philosophy text default 'similar', -- 'similar' or 'opposites'
  looking_for text,
  personality_snapshot text,
  partner_values text,
  dealbreaker text,
  area text, -- Mumbai neighbourhood
  profession text,
  embedding vector(384), -- Sentence Transformers all-MiniLM-L6-v2
  onboarding_complete boolean default false,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Introductions table (when user sends introduction to a match)
create table introductions (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  status text default 'pending', -- 'pending', 'accepted', 'declined'
  compatibility_score float,
  match_reason text,
  sent_at timestamp with time zone default timezone('utc', now()),
  responded_at timestamp with time zone,
  unique(sender_id, receiver_id)
);

-- Anti-ghosting commitments
create table commitments (
  id uuid default gen_random_uuid() primary key,
  introduction_id uuid references introductions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  committed_at timestamp with time zone default timezone('utc', now()),
  deadline timestamp with time zone default timezone('utc', now()) + interval '48 hours',
  fulfilled boolean default false
);

-- Row Level Security
alter table profiles enable row level security;
alter table introductions enable row level security;
alter table commitments enable row level security;

-- Policies: users can only see/edit their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Users can see introductions they're involved in
create policy "Users can view own introductions"
  on introductions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert introductions"
  on introductions for insert with check (auth.uid() = sender_id);

create policy "Users can update introductions they received"
  on introductions for update using (auth.uid() = receiver_id);

-- Function to update updated_at automatically
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();
