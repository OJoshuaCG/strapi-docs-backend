# Backend — Sistema de Documentación

Strapi v5 backend (sin Docker) + base de datos externa MySQL.

---

## Stack tecnológico

| Servicio | Versión | Puerto | Propósito |
|---|---|---|---|
| **Strapi v5** | 5.42.0 | `1337` | CMS + panel admin + REST API |
| **MySQL** | externo | `3306` | Base de datos (proporcionada externamente) |

---

## Estructura de directorios

```
backend/
├── .env.example              ← Variables de entorno (copia → .env)
├── .gitignore
├── package.json
├── tsconfig.json
├── server.js                   ← Entry point de Strapi
├── favicon.png
│
├── config/                   ← Configuración de Strapi
│   ├── admin.ts
│   ├── api.ts
│   ├── database.ts
│   ├── middlewares.ts
│   ├── plugins.ts
│   └── server.ts
│
├── src/                     ← Código fuente de Strapi
│   ├── index.ts              ← Bootstrap: configura permisos públicos al iniciar
│   ├── api/                 ← Content Types
│   ├── admin/               ← Personalización del panel admin
│   ├── components/          ← Componentes reutilizables
│   └── middlewares/         ← Middlewares personalizados
│
├── public/                  ← Archivos estáticos
│   └── uploads/
│
├── database/
│   └── migrations/          ← Migraciones auto-generadas
│
├── types/
│   └── generated/           ← Tipos TypeScript generados
│
└── docs/                    ← Documentación
    ├── strapi-para-desarrolladores.md
    ├── strapi-for-dummies.md
    ├── wasabi-s3.md
    ├── troubleshooting.md
    ├── maintenance.md
    ├── herramientas.md
    └── api-reference.md
```

---

## Quick start — Desarrollo

### 1. Copia y configura las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y rellena los valores requeridos:
- Configuración de la base de datos MySQL externa
- Secrets de Strapi (genera con el comando de abajo)

Genera los secrets de Strapi:
```bash
# APP_KEYS — mínimo 2, separadas por coma
node -e "const c=require('crypto'); console.log([1,2].map(()=>c.randomBytes(32).toString('base64')).join(','))"

# El resto (uno por variable)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Inicia el servidor de desarrollo

```bash
npm run develop
```

El servidor arrancará en `http://localhost:1337`.

### 4. Crea el superadministrador de Strapi

Solo en el **primer arranque**. Abre en el navegador:

```
http://localhost:1337/admin
```

Strapi mostrará un formulario de registro. Crea tu cuenta de administrador.

### 5. Agrega el locale inglés

```
Panel admin → Settings → Internationalization → Add a locale → English (en)
```

Esto solo se hace una vez y es necesario para crear contenido bilingüe.

### 6. Verifica los permisos de la API pública

El bootstrap de Strapi los configura automáticamente al arrancar. Para verificar:

```bash
curl http://localhost:1337/api/documentation-categories
# Debe retornar: {"data":[], "meta":{...}}  — sin error 403
```

Si retorna `403`, reinicia el servidor: `Ctrl+C` y nuevamente `npm run develop`.

---

## Comandos útiles

```bash
# Desarrollo (con hot-reload)
npm run develop
npm run dev

# Producción (build primero)
npm run build
npm run start

# Consola de Strapi
npm run console
```

---

## Producción

1. Configura las variables de entorno en `.env`:
   - `DATABASE_HOST` → tu servidor MySQL externo
   - Secrets de Strapi
   - `FRONTEND_URL` → URL del frontend en producción

2. Build y start:
```bash
npm run build
npm run start
```

3. Usa un process manager como PM2 para mantener el servidor corriendo:
```bash
pm2 start server.js --name strapi
```

---

## Documentación

| Documento | Audiencia | Contenido |
|---|---|---|
| [strapi-para-desarrolladores.md](./docs/strapi-para-desarrolladores.md) | Desarrolladores | Content Types, config, bootstrap, CLI |
| [strapi-for-dummies.md](./docs/strapi-for-dummies.md) | Editores de contenido | Cómo usar el panel admin |
| [wasabi-s3.md](./docs/wasabi-s3.md) | Desarrolladores | Setup del bucket S3 |
| [maintenance.md](./docs/maintenance.md) | DevOps | Operaciones del día a día |
| [troubleshooting.md](./docs/troubleshooting.md) | Todos | Resolución de problemas |
| [herramientas.md](./docs/herramientas.md) | Todos | Índice de herramientas |
| [api-reference.md](./docs/api-reference.md) | Desarrolladores | Referencia de la API REST |