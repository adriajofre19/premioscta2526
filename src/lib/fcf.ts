import * as cheerio from 'cheerio';
import type { TarjetasPartido } from './fcf-acta';
import { fetchTarjetasActa } from './fcf-acta';

const TEMPORADA = '2526';
const DEPORTE = 'futbol-11';
export const GRUPOS = [1, 2, 3, 4] as const;
export const JORNADA_INICIO = 1;
export const JORNADA_FIN = 30;
const FETCH_DELAY_MS = 200;

export type PartidoScraped = {
  local: string;
  visitante: string;
  resultado: string;
  arbitro: string;
  grupo: number;
  jornada: number;
  url_acta: string | null;
} & TarjetasPartido;

const TARJETAS_CERO: TarjetasPartido = {
  amarillas_local: 0,
  amarillas_visitante: 0,
  rojas_local: 0,
  rojas_visitante: 0,
  amarillas_ct_local: 0,
  amarillas_ct_visitante: 0,
  rojas_ct_local: 0,
  rojas_ct_visitante: 0,
};

function resolveActaUrl(href: string | undefined): string | null {
  if (!href?.trim()) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith('http')) return trimmed;
  if (trimmed.startsWith('/')) return `https://www.fcf.cat${trimmed}`;
  return `https://www.fcf.cat/${trimmed}`;
}

export function buildUrlResultados(categoria: string, grupo: number, jornada: number) {
  const slug = categoria.trim();
  return `https://www.fcf.cat/resultats/${TEMPORADA}/${DEPORTE}/${slug}/grup-${grupo}/jornada-${jornada}`;
}

export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function scrapePartidos(html: string, grupo: number, jornada: number): PartidoScraped[] {
  const $ = cheerio.load(html);

  return $('table.table_resultats tr.linia')
    .map((_, tr) => {
      const row = $(tr);

      const local = row.find('td.resultats-w-equip.tr a').first().text().trim();
      const visitante = row.find('td.resultats-w-equip.tl a').first().text().trim();
      const resultado = row.find('td.resultats-w-resultat .fs-17').first().text().trim();
      const url_acta = resolveActaUrl(
        row.find('td.resultats-w-resultat a').first().attr('href')
      );

      const td = row.find('td.resultats-w-text2').first();
      const clone = td.clone();
      clone.find('a').first().remove();
      const arbitro = clone.text().replace(/\s+/g, ' ').trim();

      if (!local || !visitante || !resultado) return null;

      return { local, visitante, resultado, arbitro, grupo, jornada, url_acta, ...TARJETAS_CERO };
    })
    .get()
    .filter((p): p is PartidoScraped => p !== null);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function partidoKey(p: PartidoScraped) {
  return `${p.grupo}|${p.jornada}|${p.local}|${p.visitante}|${p.resultado}`;
}

export async function fetchPartidosArbitro(categoria: string, nombreArbitro: string) {
  const nombreBuscado = normalizar(nombreArbitro);
  const partidosMap = new Map<string, PartidoScraped>();
  const errores: { grupo: number; jornada: number; mensaje: string }[] = [];

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
          mensaje: e instanceof Error ? e.message : 'Error desconocido',
        });
      }

      if (FETCH_DELAY_MS > 0) {
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
