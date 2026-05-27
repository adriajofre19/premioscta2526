import * as cheerio from 'cheerio';

export type TarjetasEquipo = {
  amarillas: number;
  rojas: number;
  amarillas_ct: number;
  rojas_ct: number;
};

export type TarjetasPartido = {
  amarillas_local: number;
  amarillas_visitante: number;
  rojas_local: number;
  rojas_visitante: number;
  amarillas_ct_local: number;
  amarillas_ct_visitante: number;
  rojas_ct_local: number;
  rojas_ct_visitante: number;
};

const TARJETAS_VACIAS: TarjetasPartido = {
  amarillas_local: 0,
  amarillas_visitante: 0,
  rojas_local: 0,
  rojas_visitante: 0,
  amarillas_ct_local: 0,
  amarillas_ct_visitante: 0,
  rojas_ct_local: 0,
  rojas_ct_visitante: 0,
};

function tieneNumeroJugador(numText: string): boolean {
  const limpio = numText.replace(/\u00a0/g, '').trim();
  return limpio !== '' && /^\d+$/.test(limpio);
}

function contarTarjetasTabla($: cheerio.CheerioAPI, table: cheerio.Element): TarjetasEquipo {
  const stats: TarjetasEquipo = {
    amarillas: 0,
    rojas: 0,
    amarillas_ct: 0,
    rojas_ct: 0,
  };

  $(table)
    .find('tbody tr')
    .each((_, tr) => {
      const row = $(tr);
      const numText = row.find('.num-samarreta-acta2').first().text();
      const esJugador = tieneNumeroJugador(numText);

      const amarillas = row.find('.groga-s').length;
      const rojas = row.find('.vermella-s').length;

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

export function scrapeTarjetasActa(html: string): TarjetasPartido {
  const $ = cheerio.load(html);

  const tablasTargetes = $('table.acta-table')
    .filter((_, table) => {
      const titulo = $(table).find('thead th').first().text().trim();
      return titulo === 'Targetes';
    })
    .toArray();

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
    rojas_ct_visitante: visitante.rojas_ct,
  };
}

export async function fetchTarjetasActa(urlActa: string): Promise<TarjetasPartido> {
  try {
    const res = await fetch(urlActa);
    if (!res.ok) return { ...TARJETAS_VACIAS };

    const html = await res.text();
    return scrapeTarjetasActa(html);
  } catch {
    return { ...TARJETAS_VACIAS };
  }
}
