-- Ejecutar en Supabase → SQL Editor si el insert desde /admin falla por RLS

alter table public.arbitros enable row level security;

drop policy if exists "insert publica arbitros" on public.arbitros;
create policy "insert publica arbitros"
  on public.arbitros for insert
  with check (true);
