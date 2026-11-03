-- Farming Simulator GUIDE PRO: conținut public administrat din Admin Panel
create table if not exists public.fs_public_content (
 id uuid primary key default gen_random_uuid(),
 category text not null check(category in ('guides','machines','crops','animals','info')),
 title text not null, body text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.fs_public_content enable row level security;
drop policy if exists "Public can read FS content" on public.fs_public_content;
create policy "Public can read FS content" on public.fs_public_content for select using (true);
-- Admin email: schimbă valoarea de mai jos cu emailul REAL al contului Google admin.
drop policy if exists "Admin can insert FS content" on public.fs_public_content;
create policy "Admin can insert FS content" on public.fs_public_content for insert
with check (lower(coalesce(auth.jwt()->>'email','')) = lower('alexandrujoanta6@gmail.com'));
drop policy if exists "Admin can update FS content" on public.fs_public_content;
create policy "Admin can update FS content" on public.fs_public_content for update
using (lower(coalesce(auth.jwt()->>'email','')) = lower('alexandrujoanta6@gmail.com'))
with check (lower(coalesce(auth.jwt()->>'email','')) = lower('alexandrujoanta6@gmail.com'));
drop policy if exists "Admin can delete FS content" on public.fs_public_content;
create policy "Admin can delete FS content" on public.fs_public_content for delete
using (lower(coalesce(auth.jwt()->>'email','')) = lower('alexandrujoanta6@gmail.com'));
