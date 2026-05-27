import { c as createComponent } from './astro-component_BaUWcwXf.mjs';
import 'piccolore';
import { s as renderComponent, v as renderTemplate, q as maybeRenderHead, d as Fragment, k as addAttribute } from './entrypoint_Dvglin5i.mjs';
import { r as renderScript } from './script_B8PTcjQE.mjs';
import { $ as $$Layout } from './Layout_i_Srna4P.mjs';
import { s as supabase } from './supabase_C9_4YXlB.mjs';

const $$Comparar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Comparar;
  const { data: arbitrosData, error } = await supabase.from("arbitros").select("id, nombre, categoria").order("nombre", { ascending: true });
  const arbitros = arbitrosData ?? [];
  const categorias = [...new Set(arbitros.map((a) => a.categoria))].sort();
  const selectedIds = Astro2.url.searchParams.getAll("ids").map((v) => Number(v)).filter((v) => Number.isInteger(v));
  const nombreInicial = Astro2.url.searchParams.get("nombre")?.trim() ?? "";
  const categoriaInicial = Astro2.url.searchParams.get("categoria")?.trim() ?? "";
  let partidos = [];
  if (selectedIds.length > 0) {
    const { data: partidosData } = await supabase.from("partidos").select(
      "id, arbitro_id, local, visitante, resultado, grupo, jornada, url_acta, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante, amarillas_ct_local, amarillas_ct_visitante, rojas_ct_local, rojas_ct_visitante, created_at"
    ).in("arbitro_id", selectedIds);
    partidos = partidosData ?? [];
  }
  function parseGoles(resultado) {
    const m = resultado.match(/(\d+)\s*-\s*(\d+)/);
    if (!m) return null;
    return { local: Number(m[1]), visitante: Number(m[2]) };
  }
  function calcResumen(arbitro, rows) {
    let victorias_local = 0;
    let victorias_visitante = 0;
    let empates = 0;
    let goles_totales = 0;
    let amarillas_totales = 0;
    let rojas_totales = 0;
    for (const p of rows) {
      const goles = parseGoles(p.resultado);
      if (goles) {
        goles_totales += goles.local + goles.visitante;
        if (goles.local > goles.visitante) victorias_local++;
        else if (goles.visitante > goles.local) victorias_visitante++;
        else empates++;
      }
      amarillas_totales += (p.amarillas_local ?? 0) + (p.amarillas_visitante ?? 0) + (p.amarillas_ct_local ?? 0) + (p.amarillas_ct_visitante ?? 0);
      rojas_totales += (p.rojas_local ?? 0) + (p.rojas_visitante ?? 0) + (p.rojas_ct_local ?? 0) + (p.rojas_ct_visitante ?? 0);
    }
    const n = rows.length;
    const fmt = (value) => n > 0 ? (value / n).toFixed(2) : "—";
    return {
      arbitro,
      partidos: n,
      victorias_local,
      victorias_visitante,
      empates,
      goles_totales,
      amarillas_totales,
      rojas_totales,
      media_amarillas: fmt(amarillas_totales),
      media_rojas: fmt(rojas_totales),
      media_goles: fmt(goles_totales)
    };
  }
  const resumenes = selectedIds.map((id) => arbitros.find((a) => a.id === id)).filter((a) => Boolean(a)).map((a) => calcResumen(a, partidos.filter((p) => p.arbitro_id === a.id)));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-6xl px-4 py-8"> <a href="/" class="text-sm text-blue-600 hover:underline">← Volver al inicio</a> <header class="mt-4 border-b border-gray-200 pb-6"> <h1 class="text-2xl font-bold text-gray-900">Comparar árbitros</h1> <p class="mt-1 text-gray-600">Selecciona los árbitros y compara resultados y medias</p> </header> ${error && renderTemplate`<p class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
Error al cargar árbitros: ${error.message} </p>`} ${!error && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <section class="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"> <form id="form-comparar" method="get"> <div class="grid gap-3 sm:grid-cols-3"> <div class="sm:col-span-2"> <label for="filtro-nombre" class="mb-1 block text-xs font-medium text-gray-600">Nombre</label> <input id="filtro-nombre" type="search" name="nombre"${addAttribute(nombreInicial, "value")} placeholder="Filtrar árbitros por nombre" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"> </div> <div> <label for="filtro-categoria" class="mb-1 block text-xs font-medium text-gray-600">Categoría</label> <select id="filtro-categoria" name="categoria" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"> <option value="">Todas</option> ${categorias.map((cat) => renderTemplate`<option${addAttribute(cat, "value")}${addAttribute(cat === categoriaInicial, "selected")}>${cat}</option>`)} </select> </div> </div> <div class="mt-4 flex flex-wrap gap-2"> <button type="button" id="btn-seleccionar-visibles" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
Seleccionar visibles
</button> <button type="button" id="btn-limpiar-seleccion" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
Limpiar selección
</button> <button type="submit" class="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
Comparar
</button> </div> <p class="mt-3 text-sm text-gray-500">
Seleccionados: <span id="contador-seleccionados" class="font-medium text-gray-700">${selectedIds.length}</span> </p> <ul id="lista-selector" class="mt-4 grid max-h-80 gap-2 overflow-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-2"> ${arbitros.map((a) => renderTemplate`<li${addAttribute(a.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), "data-nombre")}${addAttribute(a.categoria, "data-categoria")} class="rounded-lg border border-gray-100 p-2"> <label class="flex cursor-pointer items-center gap-2"> <input type="checkbox" name="ids"${addAttribute(a.id, "value")}${addAttribute(selectedIds.includes(a.id), "checked")}> <span class="min-w-0"> <span class="block truncate text-sm font-medium text-gray-800">${a.nombre}</span> <span class="text-xs text-gray-500">${a.categoria}</span> </span> </label> </li>`)} </ul> </form> </section> <section class="mt-8"> <h2 class="mb-3 text-lg font-semibold text-gray-900">Resultados comparados</h2> ${resumenes.length === 0 ? renderTemplate`<p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
Selecciona uno o más árbitros y pulsa «Comparar».
</p>` : renderTemplate`<div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"> <table class="min-w-full text-sm"> <thead class="bg-gray-50 text-gray-600"> <tr> <th class="px-4 py-2 text-left">Árbitro</th> <th class="px-4 py-2 text-right">Partidos</th> <th class="px-4 py-2 text-right">V. Local</th> <th class="px-4 py-2 text-right">Empates</th> <th class="px-4 py-2 text-right">V. Visit.</th> <th class="px-4 py-2 text-right">Media goles</th> <th class="px-4 py-2 text-right">Media amarillas</th> <th class="px-4 py-2 text-right">Media rojas</th> </tr> </thead> <tbody class="divide-y divide-gray-100"> ${resumenes.map((r) => renderTemplate`<tr> <td class="px-4 py-2"> <a${addAttribute(`/arbitros/${r.arbitro.id}`, "href")} class="font-medium text-blue-700 hover:underline">${r.arbitro.nombre}</a> <div class="text-xs text-gray-500">${r.arbitro.categoria}</div> </td> <td class="px-4 py-2 text-right">${r.partidos}</td> <td class="px-4 py-2 text-right">${r.victorias_local}</td> <td class="px-4 py-2 text-right">${r.empates}</td> <td class="px-4 py-2 text-right">${r.victorias_visitante}</td> <td class="px-4 py-2 text-right">${r.media_goles}</td> <td class="px-4 py-2 text-right">${r.media_amarillas}</td> <td class="px-4 py-2 text-right">${r.media_rojas}</td> </tr>`)} </tbody> </table> </div>`} </section> ` })}`} </div> ${renderScript($$result2, "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/comparar.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/comparar.astro", void 0);

const $$file = "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/comparar.astro";
const $$url = "/comparar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Comparar,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
