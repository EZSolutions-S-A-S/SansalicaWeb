// Whitelist de filtros soportados por GET /api/inmuebles/. Sin dependencias de
// servidor (nada de fetch ni env vars) a propósito: este módulo lo importan tanto
// código server-only (src/lib/inmuebles.ts) como el script de cliente de
// FiltrosSidebar.astro, y no debe arrastrar nada sensible al bundle del navegador.
export const FILTER_PARAMS = [
  'departamento',
  'ciudad',
  'operation_type',
  'property_type',
  'min_price',
  'max_price',
  'min_bedrooms',
  'min_bathrooms',
  'min_parking_spots',
] as const;

// features/amenities aceptan varios valores a la vez (?features=Balcón&features=Terraza),
// a diferencia de FILTER_PARAMS que son de un solo valor.
export const MULTI_FILTER_PARAMS = ['features', 'amenities'] as const;

export type FilterParam = (typeof FILTER_PARAMS)[number];
export type MultiFilterParam = (typeof MULTI_FILTER_PARAMS)[number];
export type Filters = Partial<Record<FilterParam, string>> & Partial<Record<MultiFilterParam, string[]>>;
