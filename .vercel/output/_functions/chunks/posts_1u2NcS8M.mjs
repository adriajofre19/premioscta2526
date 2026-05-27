import * as cheerio from 'cheerio';

const GET = async () => {
  const res = await fetch("https://www.fcf.cat/resultats/2526/futbol-11/quarta-catalana/grup-1");
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "No se pudo cargar FCF" }), { status: 500 });
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const partidos = $("table.table_resultats tr.linia").map((_, tr) => {
    const row = $(tr);
    const local = row.find("td.resultats-w-equip.tr a").first().text().trim();
    const visitante = row.find("td.resultats-w-equip.tl a").first().text().trim();
    const resultado = row.find("td.resultats-w-resultat .fs-17").first().text().trim();
    const td = row.find("td.resultats-w-text2").first();
    const clone = td.clone();
    clone.find("a").first().remove();
    const arbitro = clone.text().replace(/\s+/g, " ").trim();
    console.log(arbitro);
    if (!local || !visitante || !resultado) return null;
    return { local, visitante, resultado, arbitro };
  }).get().filter(Boolean);
  return new Response(JSON.stringify({ partidos }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
