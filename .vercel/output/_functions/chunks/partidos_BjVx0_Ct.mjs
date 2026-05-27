import { g as getArbitro, a as getPartidosFromDb } from './partidos-db_C6LW8B0J.mjs';

const GET = async ({ params }) => {
  const { arbitro, error } = await getArbitro(params.id);
  if (error || !arbitro) {
    return new Response(JSON.stringify({ error }), { status: error === "Árbitro no encontrado" ? 404 : 400 });
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
      source: "database",
      partidos_sync_at: arbitro.partidos_sync_at ?? null
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
