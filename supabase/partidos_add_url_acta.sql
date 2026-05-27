-- Si ya creaste la tabla partidos, ejecuta solo esto en Supabase → SQL Editor
alter table public.partidos
  add column if not exists url_acta text;

comment on column public.partidos.url_acta is 'Enlace al acta del partido en fcf.cat';
