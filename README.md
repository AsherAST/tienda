# Tienda Online

E-commerce full-stack con catálogo, búsqueda y filtros, carrito, checkout con pedidos y panel de administración. Construido con Next.js, Prisma y PostgreSQL.

## Características

- **Catálogo público**: listado de productos con búsqueda, filtros por categoría/precio, ordenamiento y paginación. Página de detalle por producto.
- **Carrito**: agregar/quitar productos, cantidades y subtotal, persistente en cookies.
- **Checkout y pedidos**: datos de envío (nombre, dirección, ciudad, teléfono), creación transaccional de pedidos con descuento de stock, "Mis pedidos" con detalle. Cancelación de pedido que devuelve stock.
- **Autenticación**: Auth.js v5 con credenciales y roles `CUSTOMER` / `ADMIN`. Registro, login, logout y protección de rutas.
- **Recuperación de contraseña**: enlace "¿Olvidaste tu contraseña?" con token de un solo uso (expira en 1 h). En modo demo el enlace de recuperación se muestra en pantalla.
- **Panel admin**: CRUD de productos (crear/editar/eliminar, slug autogenerado, stock) y gestión de pedidos (selector de estado). Subida de imágenes con Vercel Blob.
- **UI**: Next.js App Router, Tailwind CSS, fuente Geist, diseño responsive con navbar sticky y footer.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL (Neon)
- Auth.js v5 (next-auth) con roles en JWT
- Zod para validación
- Vercel Blob para imágenes
- Vitest + Testing Library para tests unitarios

## Requisitos

- Node.js 22+
- Base de datos PostgreSQL (ej. Neon)
- Cuenta en Vercel (opcional, para Blob y deploy)

## Configuración

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm ci
   ```

2. Crear el archivo `.env.local` con las variables de entorno (ver `.env.example`):

   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/tienda"
   DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/tienda?sslmode=require"
   AUTH_SECRET="generar-con: openssl rand -hex 32"
   BLOB_READ_WRITE_TOKEN="..."   # opcional, solo para subir imágenes
   APP_URL="https://tienda.vercel.app"   # opcional; por defecto usa VERCEL_URL o localhost
   ```

3. Aplicar migraciones y sembrar datos de ejemplo:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Ejecutar en desarrollo:

   ```bash
   npm run dev
   ```

## Usuarios de prueba

| Rol      | Email              | Password   |
| -------- | ------------------ | ---------- |
| Cliente  | `demo@tienda.cl`   | `demo1234` |
| Admin    | `admin@tienda.cl`  | `admin1234` |

## Scripts

```bash
npm run dev          # desarrollo
npm run build        # build de producción
npm run start        # producción
npm run lint         # eslint
npm test             # tests unitarios (vitest)
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio
```

## CI

GitHub Actions ejecuta lint, tests, build, migraciones y seed en cada push a `main` y pull request.

## Deploy

Desplegado en Vercel con PostgreSQL en Neon.
