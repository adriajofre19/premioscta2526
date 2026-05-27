import { supabase } from '../db/supabase';
import { fetchPartidosArbitro } from './fcf';

export type PartidoRow = {
  id: number;
  arbitro_id: number;
  local: string;
  visitante: string;
  resultado: string;
  grupo: number;
  jornada: number;
  url_acta: string | null;
  amarillas_local: number;
  amarillas_visitante: number;
  rojas_local: number;
  rojas_visitante: number;
  amarillas_ct_local: number;
  amarillas_ct_visitante: number;
  rojas_ct_local: number;
  rojas_ct_visitante: number;
  created_at?: string;
};

export async function getArbitro(id: string | undefined) {
  if (!id) return { arbitro: null, error: 'ID no válido' };

  const { data: arbitro, error } = await supabase
    .from('arbitros')
    .select('id, nombre, categoria, partidos_sync_at')
    .eq('id', id)
    .single();

  if (error || !arbitro) {
    return { arbitro: null, error: 'Árbitro no encontrado' };
  }

  if (!arbitro.categoria?.trim()) {
    return { arbitro: null, error: 'El árbitro no tiene categoría en la base de datos' };
  }

  return { arbitro, error: null };
}

export async function getPartidosFromDb(arbitroId: string | number) {
  const { data, error } = await supabase
    .from('partidos')
    .select(
      'id, arbitro_id, local, visitante, resultado, grupo, jornada, url_acta, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante, amarillas_ct_local, amarillas_ct_visitante, rojas_ct_local, rojas_ct_visitante, created_at'
    )
    .eq('arbitro_id', arbitroId)
    .order('jornada', { ascending: true })
    .order('grupo', { ascending: true })
    .order('local', { ascending: true });

  return { partidos: (data ?? []) as PartidoRow[], error };
}

export async function syncPartidosToDb(arbitroId: string | number) {
  const { arbitro, error: arbitroError } = await getArbitro(String(arbitroId));
  if (arbitroError || !arbitro) {
    return { ok: false as const, error: arbitroError ?? 'Árbitro no encontrado' };
  }

  const { partidos, errores } = await fetchPartidosArbitro(arbitro.categoria, arbitro.nombre);

  const { error: deleteError } = await supabase
    .from('partidos')
    .delete()
    .eq('arbitro_id', arbitro.id);

  if (deleteError) {
    return { ok: false as const, error: deleteError.message };
  }

  if (partidos.length > 0) {
    const rows = partidos.map((p) => ({
      arbitro_id: arbitro.id,
      local: p.local,
      visitante: p.visitante,
      resultado: p.resultado,
      grupo: p.grupo,
      jornada: p.jornada,
      url_acta: p.url_acta,
      amarillas_local: p.amarillas_local,
      amarillas_visitante: p.amarillas_visitante,
      rojas_local: p.rojas_local,
      rojas_visitante: p.rojas_visitante,
      amarillas_ct_local: p.amarillas_ct_local,
      amarillas_ct_visitante: p.amarillas_ct_visitante,
      rojas_ct_local: p.rojas_ct_local,
      rojas_ct_visitante: p.rojas_ct_visitante,
    }));

    const { error: insertError } = await supabase.from('partidos').insert(rows);

    if (insertError) {
      return { ok: false as const, error: insertError.message };
    }
  }

  await supabase
    .from('arbitros')
    .update({ partidos_sync_at: new Date().toISOString() })
    .eq('id', arbitro.id);

  return {
    ok: true as const,
    total: partidos.length,
    errores: errores.length > 0 ? errores : undefined,
  };
}
