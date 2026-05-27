import type { APIRoute } from 'astro';
import { getArbitro, getPartidosFromDb } from '../../../../lib/partidos-db';

/** GET: partidos desde Supabase (rápido). */
export const GET: APIRoute = async ({ params }) => {
  const { arbitro, error } = await getArbitro(params.id);

  if (error || !arbitro) {
    return new Response(JSON.stringify({ error }), { status: error === 'Árbitro no encontrado' ? 404 : 400 });
  }

  const { partidos, error: partidosError } = await getPartidosFromDb(arbitro.id);

  if (partidosError) {
    return new Response(JSON.stringify({ error: partidosError }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      arbitro,
      total: partidos.length,
      partidos,
      source: 'database',
      partidos_sync_at: arbitro.partidos_sync_at ?? null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
