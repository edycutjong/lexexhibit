-- LexExhibit — Supabase Schema
-- Run this in your Supabase SQL editor to initialize the database.

-- ── cached_traces ─────────────────────────────────────────────────────────────
-- Stores wallet scan results so repeated investigations return instantly.
-- Expires after 7 days to keep data fresh.
create table if not exists cached_traces (
  id              uuid        primary key default gen_random_uuid(),
  wallet_address  text        not null,
  chain           text        not null default 'ethereum',
  tx_data         jsonb       not null,
  tx_count        integer     not null default 0,
  total_value_usd numeric     not null default 0,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days'),

  constraint cached_traces_wallet_chain_key unique (wallet_address, chain)
);

create index if not exists cached_traces_wallet_idx on cached_traces (wallet_address, chain);
create index if not exists cached_traces_expires_idx on cached_traces (expires_at);

-- ── generated_reports ─────────────────────────────────────────────────────────
-- Stores every affidavit that was generated: who requested it, what exhibits
-- were produced, and when. Useful for audit trail and analytics.
create table if not exists generated_reports (
  id              uuid        primary key default gen_random_uuid(),
  wallet_address  text        not null,
  sections        jsonb       not null,
  exhibit_count   integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists generated_reports_wallet_idx on generated_reports (wallet_address);
create index if not exists generated_reports_created_idx on generated_reports (created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Hackathon mode: anon key can read and write (no user auth required).
-- Tighten this to service-role-only writes before going to production.
alter table cached_traces    enable row level security;
alter table generated_reports enable row level security;

create policy "anon full access cached_traces"
  on cached_traces for all
  using (true)
  with check (true);

create policy "anon full access generated_reports"
  on generated_reports for all
  using (true)
  with check (true);
