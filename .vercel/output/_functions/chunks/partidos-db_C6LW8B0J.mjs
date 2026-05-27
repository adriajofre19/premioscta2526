import { s as supabase } from './supabase_C9_4YXlB.mjs';
import * as cheerio from 'cheerio';

const TARJETAS_VACIAS = {
  amarillas_local: 0,
  amarillas_visitante: 0,
  rojas_local: 0,
  rojas_visitante: 0,
  amarillas_ct_local: 0,
  amarillas_ct_visitante: 0,
  rojas_ct_local: 0,
  rojas_ct_visitante: 0
};
function tieneNumeroJugador(numText) {
  const limpio = numText.replace(/\u00a0/g, "").trim();
  return limpio !== "" && /^\d+$/.test(limpio);
}
function contarTarjetasTabla($, table) {
  const stats = {
    amarillas: 0,
    rojas: 0,
    amarillas_ct: 0,
    rojas_ct: 0
  };
  $(table).find("tbody tr").each((_, tr) => {
    const row = $(tr);
    const numText = row.find(".num-samarreta-acta2").first().text();
    const esJugador = tieneNumeroJugador(numText);
    const amarillas = row.find(".groga-s").length;
    const rojas = row.find(".vermella-s").length;
    if (esJugador) {
      stats.amarillas += amarillas;
      stats.rojas += rojas;
    } else {
      stats.amarillas_ct += amarillas;
      stats.rojas_ct += rojas;
    }
  });
  return stats;
}
function scrapeTarjetasActa(html) {
  const $ = cheerio.load(html);
  const tablasTargetes = $("table.acta-table").filter((_, table) => {
    const titulo = $(table).find("thead th").first().text().trim();
    return titulo === "Targetes";
  }).toArray();
  if (tablasTargetes.length < 2) {
    return { ...TARJETAS_VACIAS };
  }
  const local = contarTarjetasTabla($, tablasTargetes[0]);
  const visitante = contarTarjetasTabla($, tablasTargetes[1]);
  return {
    amarillas_local: local.amarillas,
    amarillas_visitante: visitante.amarillas,
    rojas_local: local.rojas,
    rojas_visitante: visitante.rojas,
    amarillas_ct_local: local.amarillas_ct,
    amarillas_ct_visitante: visitante.amarillas_ct,
    rojas_ct_local: local.rojas_ct,
    rojas_ct_visitante: visitante.rojas_ct
  };
}
async function fetchTarjetasActa(urlActa) {
  try {
    const res = await fetch(urlActa);
    if (!res.ok) return { ...TARJETAS_VACIAS };
    const html = await res.text();
    return scrapeTarjetasActa(html);
  } catch {
    return { ...TARJETAS_VACIAS };
  }
}

const TEMPORADA = "2526";
const DEPORTE = "futbol-11";
const GRUPOS = [1, 2, 3, 4];
const JORNADA_INICIO = 1;
const JORNADA_FIN = 30;
const FETCH_DELAY_MS = 200;
const TARJETAS_CERO = {
  amarillas_local: 0,
  amarillas_visitante: 0,
  rojas_local: 0,
  rojas_visitante: 0,
  amarillas_ct_local: 0,
  amarillas_ct_visitante: 0,
  rojas_ct_local: 0,
  rojas_ct_visitante: 0
};
function resolveActaUrl(href) {
  if (!href?.trim()) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith("http")) return trimmed;
  if (trimmed.startsWith("/")) return `https://www.fcf.cat${trimmed}`;
  return `https://www.fcf.cat/${trimmed}`;
}
function buildUrlResultados(categoria, grupo, jornada) {
  const slug = categoria.trim();
  return `https://www.fcf.cat/resultats/${TEMPORADA}/${DEPORTE}/${slug}/grup-${grupo}/jornada-${jornada}`;
}
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
}
function scrapePartidos(html, grupo, jornada) {
  const $ = cheerio.load(html);
  return $("table.table_resultats tr.linia").map((_, tr) => {
    const row = $(tr);
    const local = row.find("td.resultats-w-equip.tr a").first().text().trim();
    const visitante = row.find("td.resultats-w-equip.tl a").first().text().trim();
    const resultado = row.find("td.resultats-w-resultat .fs-17").first().text().trim();
    const url_acta = resolveActaUrl(
      row.find("td.resultats-w-resultat a").first().attr("href")
    );
    const td = row.find("td.resultats-w-text2").first();
    const clone = td.clone();
    clone.find("a").first().remove();
    const arbitro = clone.text().replace(/\s+/g, " ").trim();
    if (!local || !visitante || !resultado) return null;
    return { local, visitante, resultado, arbitro, grupo, jornada, url_acta, ...TARJETAS_CERO };
  }).get().filter((p) => p !== null);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function partidoKey(p) {
  return `${p.grupo}|${p.jornada}|${p.local}|${p.visitante}|${p.resultado}`;
}
async function fetchPartidosArbitro(categoria, nombreArbitro) {
  const nombreBuscado = normalizar(nombreArbitro);
  const partidosMap = /* @__PURE__ */ new Map();
  const errores = [];
  for (let jornada = JORNADA_INICIO; jornada <= JORNADA_FIN; jornada++) {
    for (const grupo of GRUPOS) {
      const url = buildUrlResultados(categoria, grupo, jornada);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          errores.push({ grupo, jornada, mensaje: `HTTP ${res.status}` });
          continue;
        }
        const html = await res.text();
        const partidosJornada = scrapePartidos(html, grupo, jornada);
        for (const p of partidosJornada) {
          if (p.arbitro && normalizar(p.arbitro) === nombreBuscado) {
            partidosMap.set(partidoKey(p), p);
          }
        }
      } catch (e) {
        errores.push({
          grupo,
          jornada,
          mensaje: e instanceof Error ? e.message : "Error desconocido"
        });
      }
      {
        await sleep(FETCH_DELAY_MS);
      }
    }
  }
  const partidos = [...partidosMap.values()].sort((a, b) => {
    if (a.jornada !== b.jornada) return a.jornada - b.jornada;
    if (a.grupo !== b.grupo) return a.grupo - b.grupo;
    return a.local.localeCompare(b.local);
  });
  for (const p of partidos) {
    if (p.url_acta) {
      const tarjetas = await fetchTarjetasActa(p.url_acta);
      Object.assign(p, tarjetas);
      await sleep(150);
    }
  }
  return { partidos, errores };
}

async function getArbitro(id) {
  if (!id) return { arbitro: null, error: "ID no válido" };
  const { data: arbitro, error } = await supabase.from("arbitros").select("id, nombre, categoria, partidos_sync_at").eq("id", id).single();
  if (error || !arbitro) {
    return { arbitro: null, error: "Árbitro no encontrado" };
  }
  if (!arbitro.categoria?.trim()) {
    return { arbitro: null, error: "El árbitro no tiene categoría en la base de datos" };
  }
  return { arbitro, error: null };
}
async function getPartidosFromDb(arbitroId) {
  const { data, error } = await supabase.from("partidos").select(
    "id, arbitro_id, local, visitante, resultado, grupo, jornada, url_acta, amarillas_local, amarillas_visitante, rojas_local, rojas_visitante, amarillas_ct_local, amarillas_ct_visitante, rojas_ct_local, rojas_ct_visitante, created_at"
  ).eq("arbitro_id", arbitroId).order("jornada", { ascending: true }).order("grupo", { ascending: true }).order("local", { ascending: true });
  return { partidos: data ?? [], error };
}
async function syncPartidosToDb(arbitroId) {
  const { arbitro, error: arbitroError } = await getArbitro(String(arbitroId));
  if (arbitroError || !arbitro) {
    return { ok: false, error: arbitroError ?? "Árbitro no encontrado" };
  }
  const { partidos, errores } = await fetchPartidosArbitro(arbitro.categoria, arbitro.nombre);
  const { error: deleteError } = await supabase.from("partidos").delete().eq("arbitro_id", arbitro.id);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
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
      rojas_ct_visitante: p.rojas_ct_visitante
    }));
    const { error: insertError } = await supabase.from("partidos").insert(rows);
    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }
  await supabase.from("arbitros").update({ partidos_sync_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", arbitro.id);
  return {
    ok: true,
    total: partidos.length,
    errores: errores.length > 0 ? errores : void 0
  };
}

export { getPartidosFromDb as a, getArbitro as g, syncPartidosToDb as s };
