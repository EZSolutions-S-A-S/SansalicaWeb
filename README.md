# Sansalica — Sitio Web Inmobiliario

Sitio web de la inmobiliaria Sansalica, construido con **Astro 4** en modo **SSR** (Server-Side Rendering), **TypeScript estricto**, **Tailwind CSS v3** y una arquitectura **DDD (Domain-Driven Design)**. El proyecto consume una **API REST propia desarrollada en Django + Django REST Framework**, que actúa como única fuente de datos para el catálogo de inmuebles. El hosting de producción es **Vercel**.

---

## Stack tecnológico

| Tecnología | Uso |
| --- | --- |
| [Astro 4](https://docs.astro.build) | Framework principal, renderizado SSR |
| TypeScript (modo estricto) | Tipado estático en todo el proyecto |
| Tailwind CSS v3 | Estilos y sistema de diseño |
| Django + Django REST Framework | API REST propia, única fuente de datos |
| Vercel | Hosting y despliegue |

---

## Arquitectura (DDD)

El proyecto sigue una arquitectura basada en **Domain-Driven Design**, separando la lógica de negocio de los detalles de infraestructura. Esto permite que el dominio (las reglas de negocio de un "inmueble") no dependa de cómo se obtienen los datos.

```text
src/
├── domain/inmueble/            ← Entidad + value objects (sin dependencias externas)
├── application/inmueble/       ← Casos de uso (solo usa interfaces del dominio)
├── infrastructure/django/      ← Implementación concreta del repositorio contra la API
├── layouts/                    ← Layout base con header/footer
├── components/                 ← Componentes Astro reutilizables
└── pages/                      ← Rutas públicas del sitio
```

**Regla de dependencias:**

```
pages → application → domain ← infrastructure
```

El dominio no depende de nada. La capa de aplicación depende únicamente de las interfaces definidas en el dominio. La infraestructura implementa esas interfaces. Las páginas orquestan los casos de uso de la capa de aplicación.

Dentro de `infrastructure/django/`:

| Archivo | Responsabilidad |
| --- | --- |
| `DjangoApiClient.ts` | Cliente HTTP (`fetch`) que llama a los endpoints de la API |
| `DjangoInmuebleRepository.ts` | Implementa la interfaz `InmuebleRepository` del dominio (`findAll`, `findBySlug`, `findDestacados`) |
| `createRepository.ts` | Factory que instancia el repositorio |
| `mappers/DjangoInmuebleMapper.ts` | Mapea la respuesta JSON de la API (snake_case) a la entidad de dominio `Inmueble` |

---

## Configurar variables de entorno

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Define la URL base de la API de Django:

   ```env
   DJANGO_API_URL=http://localhost:8000/api
   ```

   En producción, reemplaza este valor por la URL real del backend ya desplegado, por ejemplo:

   ```env
   DJANGO_API_URL=https://api.sansalica.com/api
   ```

---

## Correr el proyecto localmente

### Requisitos

- Node.js 18 o superior
- npm 9 o superior
- La API de Django corriendo y accesible desde `DJANGO_API_URL`

### Instalación

```bash
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

El sitio queda disponible en `http://localhost:4321`.

### Build de producción

```bash
npm run build
npm run preview
```

`npm run build` genera la salida SSR en `./dist/`. `npm run preview` levanta un servidor local para verificar el build antes de desplegar.

---

## Personalizar información de contacto

Reemplaza los siguientes placeholders antes de publicar el sitio:

| Placeholder | Descripción | Archivo(s) |
| --- | --- | --- |
| `WHATSAPP_NUMBER` | Número de WhatsApp de contacto (formato internacional, sin espacios) | `src/components/`, `src/layouts/Layout.astro` |
| `CONTACT_EMAIL` | Correo de contacto público | `src/components/`, `src/layouts/Layout.astro` |
| `SITE_URL` | URL pública del sitio (usada en metadatos y Open Graph) | `astro.config.mjs`, `src/layouts/Layout.astro` |

---

## Agregar el logo

Coloca los siguientes assets en `public/` con estos nombres:

| Archivo | Uso |
| --- | --- |
| `public/logo.svg` | Logo principal, usado en el header |
| `public/favicon.svg` | Ícono de pestaña del navegador |
| `public/hero.jpg` | Imagen principal de la página de inicio |
| `public/og-image.jpg` | Imagen de vista previa para Open Graph (redes sociales) |

---

## Deploy en Vercel

### Desde GitHub

1. Importa el repositorio en el [dashboard de Vercel](https://vercel.com/dashboard).
2. Configura la variable de entorno `DJANGO_API_URL` en **Settings → Environment Variables**, apuntando a la URL de producción de la API.
3. Cada push a la rama principal dispara un nuevo deploy automáticamente.

### Vía CLI

```bash
npm install -g vercel
vercel
```

Al ejecutar `vercel`, configura `DJANGO_API_URL` cuando se solicite, o defínela previamente con:

```bash
vercel env add DJANGO_API_URL
```

---

## Estructura del proyecto

```text
/
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   ├── hero.jpg
│   └── og-image.jpg
├── src/
│   ├── domain/
│   │   └── inmueble/
│   │       ├── Inmueble.ts
│   │       ├── InmuebleRepository.ts
│   │       └── value-objects/
│   ├── application/
│   │   └── inmueble/
│   │       ├── ListarInmuebles.ts
│   │       ├── ObtenerInmueblePorSlug.ts
│   │       └── ListarInmueblesDestacados.ts
│   ├── infrastructure/
│   │   └── django/
│   │       ├── DjangoApiClient.ts
│   │       ├── DjangoInmuebleRepository.ts
│   │       ├── createRepository.ts
│   │       └── mappers/
│   │           └── DjangoInmuebleMapper.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── InmuebleCard.astro
│   │   └── FiltrosCatalogo.astro
│   └── pages/
│       ├── index.astro
│       ├── catalogo.astro
│       └── inmuebles/
│           └── [slug].astro
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Paleta de colores

| Token Tailwind | Uso |
| --- | --- |
| `primary` | Color principal de marca (botones, enlaces destacados) |
| `secondary` | Color de apoyo (acentos, hover) |
| `neutral` | Textos y fondos neutros |
| `success` | Estados como "disponible" |
| `warning` | Estados como "reservado" |
| `danger` | Estados como "vendido" |

---

## Páginas públicas

| Ruta | Descripción |
| --- | --- |
| `/` | Página de inicio, con inmuebles destacados y presentación general |
| `/catalogo` | Listado completo de inmuebles, con filtros por tipo de operación, tipo de inmueble y estado |
| `/inmuebles/:slug` | Detalle de un inmueble específico |
