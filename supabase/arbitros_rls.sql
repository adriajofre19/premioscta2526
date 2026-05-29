-- Ejecutar en Supabase → SQL Editor (una sola vez)
-- Corrige: "new row violates row-level security policy for table arbitros"

alter table public.arbitros enable row level security;

drop policy if exists "lectura publica arbitros" on public.arbitros;
create policy "lectura publica arbitros"
  on public.arbitros for select
  using (true);

drop policy if exists "insert publica arbitros" on public.arbitros;
create policy "insert publica arbitros"
  on public.arbitros for insert
  with check (true);
