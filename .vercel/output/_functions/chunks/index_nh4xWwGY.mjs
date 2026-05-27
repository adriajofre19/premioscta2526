import { c as createComponent } from './astro-component_BaUWcwXf.mjs';
import 'piccolore';
import { s as renderComponent, v as renderTemplate, q as maybeRenderHead, d as Fragment, k as addAttribute } from './entrypoint_Dvglin5i.mjs';
import { r as renderScript } from './script_B8PTcjQE.mjs';
import { s as supabase } from './supabase_C9_4YXlB.mjs';
import { $ as $$Layout } from './Layout_i_Srna4P.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { data: arbitros, error } = await supabase.from("arbitros").select("id, nombre, categoria").order("nombre", { ascending: true });
  const lista = arbitros ?? [];
  const categorias = [...new Set(lista.map((a) => a.categoria))].sort();
  const nombreInicial = Astro2.url.searchParams.get("nombre")?.trim() ?? "";
  const categoriaInicial = Astro2.url.searchParams.get("categoria")?.trim() ?? "";
  function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  const listaFiltrada = lista.filter((a) => {
    const matchNombre = !nombreInicial || normalizar(a.nombre).includes(normalizar(nombreInicial));
    const matchCategoria = !categoriaInicial || a.categoria === categoriaInicial;
    return matchNombre && matchCategoria;
  });
  const idsVisibles = new Set(listaFiltrada.map((a) => a.id));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-5xl px-4 py-8"> <header class="border-b border-gray-200 pb-6"> <h1 class="text-2xl font-bold text-gray-900">Premios CTA 2026</h1> <p class="mt-1 text-gray-600">Árbitros y estadísticas de partidos</p> <div class="mt-4"> <a href="/comparar" class="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
Comparar árbitros
</a> </div> </header> ${error && renderTemplate`<p class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
Error al cargar árbitros: ${error.message} </p>`} ${!error && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <section class="mt-8"> <div class="grid grid-cols-2 gap-3 sm:grid-cols-3"> <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"> <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Árbitros</p> <p class="mt-1 text-2xl font-bold text-gray-900"> <span id="contador-visible">${listaFiltrada.length}</span> <span class="text-base font-normal text-gray-400">/ ${lista.length}</span> </p> </div> <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2"> <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Categorías</p> <p class="mt-2 flex flex-wrap gap-2"> ${categorias.map((cat) => renderTemplate`<span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 ring-1 ring-blue-200"> ${cat} </span>`)} ${categorias.length === 0 && renderTemplate`<span class="text-sm text-gray-400">—</span>`} </p> </div> </div> </section> <section class="mt-10"> <h2 class="mb-4 text-lg font-semibold text-gray-900">Lista de árbitros</h2> ${lista.length === 0 ? renderTemplate`<p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
No hay árbitros en la base de datos. Añádelos en Supabase.
</p>` : renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <form id="form-filtros" method="get" class="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"> <div class="flex-1"> <label for="filtro-nombre" class="mb-1 block text-xs font-medium text-gray-600">
Nombre
</label> <input type="search" id="filtro-nombre" name="nombre"${addAttribute(nombreInicial, "value")} placeholder="Buscar por nombre..." autocomplete="off" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"> </div> <div class="sm:w-56"> <label for="filtro-categoria" class="mb-1 block text-xs font-medium text-gray-600">
Categoría
</label> <select id="filtro-categoria" name="categoria" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"> <option value="">Todas</option> ${categorias.map((cat) => renderTemplate`<option${addAttribute(cat, "value")}${addAttribute(cat === categoriaInicial, "selected")}> ${cat} </option>`)} </select> </div> <div class="flex gap-2 sm:pb-0.5"> <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
Filtrar
</button> <a href="/" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
Limpiar
</a> </div> </form> <p id="sin-resultados"${addAttribute(["hidden", "rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"], "class:list")}>
No hay árbitros que coincidan con el filtro.
</p> <ul id="lista-arbitros" class="grid gap-3 sm:grid-cols-2"> ${lista.map((a) => renderTemplate`<li${addAttribute(normalizar(a.nombre), "data-nombre")}${addAttribute(a.categoria, "data-categoria")}${addAttribute([!idsVisibles.has(a.id) && "hidden"], "class:list")}> <a${addAttribute(`/arbitros/${a.id}`, "href")} class="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"> <div class="min-w-0"> <p class="truncate font-semibold text-gray-900 group-hover:text-blue-600"> ${a.nombre} </p> <p class="mt-1 text-sm text-gray-500">Ver partidos y estadísticas</p> </div> <span class="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-800"> ${a.categoria} </span> </a> </li>`)} </ul> ` })}`} </section> ` })}`} </div> ${renderScript($$result2, "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/index.astro", void 0);

const $$file = "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
