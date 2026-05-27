-- Ejecutar en Supabase → SQL Editor

create table if not exists public.partidos (
  id bigserial primary key,
  arbitro_id bigint not null references public.arbitros (id) on delete cascade,
  local text not null,
  visitante text not null,
  resultado text not null,
  grupo smallint not null check (grupo >= 1),
  jornada smallint not null check (jornada >= 1),
  url_acta text,
  amarillas_local smallint not null default 0,
  amarillas_visitante smallint not null default 0,
  rojas_local smallint not null default 0,
  rojas_visitante smallint not null default 0,
  amarillas_ct_local smallint not null default 0,
  amarillas_ct_visitante smallint not null default 0,
  rojas_ct_local smallint not null default 0,
  rojas_ct_visitante smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint partidos_unico unique (arbitro_id, grupo, jornada, local, visitante)
);

create index if not exists partidos_arbitro_id_idx on public.partidos (arbitro_id);
create index if not exists partidos_arbitro_jornada_idx on public.partidos (arbitro_id, jornada, grupo);

alter table public.arbitros
  add column if not exists partidos_sync_at timestamptz;

comment on table public.partidos is 'Partidos de árbitros sincronizados desde fcf.cat';

-- RLS (ajusta en producción según tu auth)
alter table public.partidos enable row level security;

drop policy if exists "lectura publica partidos" on public.partidos;
create policy "lectura publica partidos"
  on public.partidos for select
  using (true);

drop policy if exists "insert publica partidos" on public.partidos;
create policy "insert publica partidos"
  on public.partidos for insert
  with check (true);

drop policy if exists "delete publica partidos" on public.partidos;
create policy "delete publica partidos"
  on public.partidos for delete
  using (true);
