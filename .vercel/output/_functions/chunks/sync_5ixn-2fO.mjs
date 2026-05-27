import { s as syncPartidosToDb, g as getArbitro, a as getPartidosFromDb } from './partidos-db_C6LW8B0J.mjs';

const POST = async ({ params }) => {
  const result = await syncPartidosToDb(params.id);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), { status: 500 });
  }
  const { arbitro } = await getArbitro(params.id);
  const { partidos } = await getPartidosFromDb(params.id);
  return new Response(
    JSON.stringify({
      ok: true,
      arbitro,
      total: result.total,
      partidos,
      errores: result.errores
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
