// Genera el mismo markup que src/components/InmueblePublicCard.astro, para insertar
// tarjetas por JS tras un filtro AJAX (ver FiltrosSidebar.astro). Usa las mismas
// clases que src/styles/property-card.css. Mantener en sync con ambos archivos.

interface Inmueble {
  id: number;
  title: string;
  operation_type: string;
  property_type: string;
  price: number | string;
  square_meters: number | string;
  location: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spots?: number | null;
  photos?: any[];
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}

function specHtml(iconPath: string, value: number | null | undefined, strokeWidth = '1.5'): string {
  if (!value) return '';
  return `
    <div class="spec">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>
      <span>${escapeHtml(value)}</span>
    </div>`;
}

function renderSkeletonCard(): string {
  return `
    <div class="property-card-skeleton">
      <div class="property-card-skeleton__image"></div>
      <div class="property-card-skeleton__content">
        <div class="property-card-skeleton__bar property-card-skeleton__bar--title"></div>
        <div class="property-card-skeleton__bar" style="width: 60%"></div>
        <div class="property-card-skeleton__bar property-card-skeleton__bar--price"></div>
      </div>
    </div>`;
}

// Placeholders mientras se espera una respuesta del proxy (ver FiltrosSidebar.astro).
// `count` debería ser la cantidad de tarjetas que ya se estaban mostrando, para que
// la grilla no cambie de tamaño de golpe.
export function renderSkeletonCards(count: number): string {
  return Array.from({ length: Math.max(count, 1) }, renderSkeletonCard).join('');
}

export function renderCardHTML(inmueble: Inmueble): string {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(inmueble.price)).replace('COP', '$').trim();

  const photos = inmueble.photos || [];
  const mainPhoto = photos.length > 0
    ? [...photos].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]
    : null;
  // Si la foto no trae url, se usa el fallback -- nunca el objeto de la foto como src.
  const mainPhotoUrl = (mainPhoto && mainPhoto.url) || FALLBACK_IMAGE;

  const displayOperation = inmueble.operation_type === 'Alquiler' ? 'Renta' : inmueble.operation_type;

  const bedroomsSpec = specHtml(
    '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    inmueble.bedrooms
  );
  const bathroomsSpec = specHtml(
    '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-1C4.67 2.5 4 3.17 4 4v2"/><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z"/><path d="M6 20v2"/><path d="M18 20v2"/>',
    inmueble.bathrooms,
    '1.8'
  );
  const parkingSpec = specHtml(
    '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    inmueble.parking_spots
  );

  return `
    <a href="/inmuebles/${inmueble.id}" class="property-card">
      <div class="property-card__image-container">
        <img src="${escapeHtml(mainPhotoUrl)}" alt="${escapeHtml(inmueble.title)}" class="property-card__image" loading="lazy" />
        <div class="property-card__badges">
          <span class="badge badge--gold">${escapeHtml(displayOperation)}</span>
          <span class="badge badge--navy">${escapeHtml(inmueble.property_type)}</span>
        </div>
      </div>

      <div class="property-card__content">
        <div class="property-card__location">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.007 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${escapeHtml(inmueble.location)}</span>
        </div>

        <h3 class="property-card__title">${escapeHtml(inmueble.title)}</h3>

        <div class="property-card__footer">
          <p class="property-card__price">${escapeHtml(formattedPrice)}</p>

          <div class="property-card__specs">
            <div class="spec">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
              <span>${escapeHtml(inmueble.square_meters)} m²</span>
            </div>
            ${bedroomsSpec}
            ${bathroomsSpec}
            ${parkingSpec}
          </div>
        </div>
      </div>
    </a>`;
}
