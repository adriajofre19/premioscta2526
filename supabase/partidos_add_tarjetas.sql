-- Si ya tienes la tabla partidos, ejecuta esto en Supabase → SQL Editor

alter table public.partidos
  add column if not exists amarillas_local smallint not null default 0,
  add column if not exists amarillas_visitante smallint not null default 0,
  add column if not exists rojas_local smallint not null default 0,
  add column if not exists rojas_visitante smallint not null default 0,
  add column if not exists amarillas_ct_local smallint not null default 0,
  add column if not exists amarillas_ct_visitante smallint not null default 0,
  add column if not exists rojas_ct_local smallint not null default 0,
  add column if not exists rojas_ct_visitante smallint not null default 0;
