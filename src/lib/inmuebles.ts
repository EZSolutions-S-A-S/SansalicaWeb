// Lógica de fetch a GET /api/inmuebles/ compartida entre el render SSR inicial
// (CatalogoSection.astro) y el endpoint proxy AJAX (src/pages/api/inmuebles.ts),
// para que ambos construyan la misma query y llamen al backend de la misma forma.

import { FILTER_PARAMS, MULTI_FILTER_PARAMS, type Filters } from './filterParams';

export { FILTER_PARAMS, MULTI_FILTER_PARAMS, type Filters, type FilterParam, type MultiFilterParam } from './filterParams';

const API_URL = import.meta.env.PUBLIC_API_URL || 'https://sansalicaback.onrender.com/api';
const API_KEY = import.meta.env.SECRET_API_KEY || '';

export function buildInmueblesQuery(searchParams: URLSearchParams): {
  filters: Filters;
  queryString: string;
} {
  const filters: Filters = {};
  const queryParams = new URLSearchParams();

  for (const key of FILTER_PARAMS) {
    const value = searchParams.get(key);
    if (value) {
      filters[key] = value;
      queryParams.set(key, value);
    }
  }

  for (const key of MULTI_FILTER_PARAMS) {
    const values = searchParams.getAll(key);
    if (values.length > 0) {
      filters[key] = values;
      for (const value of values) queryParams.append(key, value);
    }
  }

  return { filters, queryString: queryParams.toString() };
}

export interface Inmueble {
  id: number;
  title: string;
  operation_type: string;
  property_type: string;
  price: number | string;
  square_meters: number | string;
  location: string;
  departamento?: string | null;
  ciudad?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spots?: number | null;
  features?: string[];
  amenities?: string[];
  photos?: any[];
}

export async function fetchInmuebles(queryString: string): Promise<{ ok: boolean; inmuebles: Inmueble[] }> {
  try {
    const res = await fetch(`${API_URL}/inmuebles/${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Error fetching inmuebles:', res.status, res.statusText);
      return { ok: false, inmuebles: [] };
    }

    const data = await res.json();
    return { ok: true, inmuebles: data.results || data || [] };
  } catch (error) {
    console.error('Error fetching inmuebles:', error);
    return { ok: false, inmuebles: [] };
  }
}
