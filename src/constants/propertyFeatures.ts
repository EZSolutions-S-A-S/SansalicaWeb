// Catálogo de valores para los checkboxes de "Características" (features) y
// "Zonas comunes" (amenities). El backend los guarda como JSONField de texto
// libre (sin choices), así que esta lista es una convención acordada con el
// equipo de datos/backend, no una restricción impuesta por la base de datos.
// Verificado contra datos reales ya existentes en producción (GET /api/inmuebles/).
export const FEATURES: string[] = [
  'Balcón',
  'Cocina Integral',
  'Aire Acondicionado',
  'Amoblado',
  'Terraza',
  'Cuarto de Servicio',
  'Clósets Empotrados',
  'Piso en Madera',
  'Estudio',
  'Ventanas Panorámicas',
];

export const AMENITIES: string[] = [
  'Piscina',
  'Salón Social',
  'Vigilancia 24h',
  'Parqueadero Visitantes',
  'Gimnasio',
  'Ascensor',
  'Zona BBQ',
  'Portería',
  'Jardín',
  'Cancha de Tenis',
];
