import type { APIRoute } from 'astro';
import { getArbitro, getPartidosFromDb, syncPartidosToDb } from '../../../../lib/partidos-db';

/** POST: scrape FCF y guarda partidos en Supabase (lento). */
export const POST: APIRoute = async ({ params }) => {
  const result = await syncPartidosToDb(params.id!);

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }

  const { arbitro } = await getArbitro(params.id);
  const { partidos } = await getPartidosFromDb(params.id!);

  return new Response(
    JSON.stringify({
      ok: true,
      arbitro,
      total: result.total,
      partidos,
      errores: result.errores,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
