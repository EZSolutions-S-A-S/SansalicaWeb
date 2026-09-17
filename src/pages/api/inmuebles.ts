// Proxy AJAX para el catálogo: el navegador llama a este endpoint (mismo origen) en
// vez de al backend directamente, así la API key nunca sale del servidor. Usado por
// el auto-aplicar de FiltrosSidebar.astro para refrescar la grilla sin recargar la
// página.
export const prerender = false;

import type { APIRoute } from 'astro';
import { buildInmueblesQuery, fetchInmuebles, type Inmueble } from '../../lib/inmuebles';

// TTL "blando": dentro de esta ventana se sirve el caché tal cual, sin revalidar.
const SOFT_TTL_MS = 3 * 60_000;
// TTL "duro": pasado el blando pero dentro de este, se sigue sirviendo el caché
// (ya viejo) al instante, y se dispara una revalidación en segundo plano para la
// próxima vez (stale-while-revalidate). Pasado el duro, se espera el fetch real.
const HARD_TTL_MS = 10 * 60_000;
const CACHE_MAX_ENTRIES = 200;

// Caché en memoria a nivel de proceso: evita repetir la misma consulta al backend
// real. Se pierde si el proceso Node se reinicia, y no se comparte entre instancias
// si el server llegara a escalar horizontalmente — aceptable para el tráfico actual.
const cache = new Map<string, { cachedAt: number; inmuebles: Inmueble[] }>();
// Claves con una revalidación en curso, para no disparar dos fetches en paralelo al
// backend si llegan varias requests para el mismo filtro mientras está "stale".
const revalidating = new Set<string>();

function touchCache(key: string, inmuebles: Inmueble[]) {
  if (!cache.has(key) && cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { cachedAt: Date.now(), inmuebles });
}

function revalidateInBackground(key: string) {
  if (revalidating.has(key)) return;
  revalidating.add(key);
  fetchInmuebles(key)
    .then(({ ok, inmuebles }) => {
      if (ok) touchCache(key, inmuebles);
    })
    .catch((error) => console.error('Error revalidando caché de inmuebles:', error))
    .finally(() => revalidating.delete(key));
}

export const GET: APIRoute = async ({ url }) => {
  const { queryString } = buildInmueblesQuery(url.searchParams);
  const cacheKey = queryString;
  const cacheControlHeader = {
    'Cache-Control': `public, max-age=${SOFT_TTL_MS / 1000}, stale-while-revalidate=${HARD_TTL_MS / 1000}`,
  };

  const cached = cache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.cachedAt;
    if (age < HARD_TTL_MS) {
      if (age >= SOFT_TTL_MS) revalidateInBackground(cacheKey);
      return Response.json({ inmuebles: cached.inmuebles }, { headers: cacheControlHeader });
    }
  }

  const { ok, inmuebles } = await fetchInmuebles(queryString);

  if (!ok) {
    return Response.json({ error: 'No se pudo consultar el catálogo.' }, { status: 502 });
  }

  touchCache(cacheKey, inmuebles);

  return Response.json({ inmuebles }, { headers: cacheControlHeader });
};
