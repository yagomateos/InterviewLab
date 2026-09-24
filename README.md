# InterviewLab

App web para practicar entrevistas técnicas: banco de preguntas, simulacros con checklist de opciones, entrevistas que guardan lo que respondiste, y estadísticas reales por usuario. React + TypeScript + Node/Express + PostgreSQL, con auth JWT e interfaz en inglés/español.

**En producción:** [interviewlab-navy.vercel.app](https://interviewlab-navy.vercel.app) — cuentas de demo: `alice@example.com` / `bob@example.com` / `carol@example.com`, contraseña `demo1234`.

> Para la explicación de los conceptos técnicos (keyof/typeof, useMemo, useCallback, Event Loop, Promise.all/allSettled, JOINs, WHERE/HAVING, Docker) y un repaso de preguntas de entrevista con sus respuestas, ver [docs/CONCEPTS.md](docs/CONCEPTS.md).

---

## Capturas

| | |
|---|---|
| ![Panel](docs/screenshots/panel.jpg) **Panel** — resumen del progreso: preguntas totales, entrevistas, respuestas correctas y tasa de éxito, todo filtrado por el usuario logueado. | ![Preguntas](docs/screenshots/preguntas.jpg) **Banco de preguntas** — 280 preguntas en 14 categorías, con la respuesta correcta explicada debajo de cada una. |
| ![Simulación](docs/screenshots/simulacion-opciones.jpg) **Simulación** — checklist de 3 opciones por pregunta; el orden se baraja en cada intento, así que la correcta no está siempre en el mismo sitio. | ![Simulación Async](docs/screenshots/simulacion-async.jpg) **Categoría Async** — 20 preguntas sobre Promises, async/await, race conditions, AbortController y más, en inglés y español. |
| ![Entrevistas](docs/screenshots/entrevistas.jpg) **Entrevistas** — cada simulación completada se guarda aquí automáticamente, con su estado (programada / completada). | ![Detalle de entrevista](docs/screenshots/entrevista-respuesta.jpg) **Detalle de entrevista** — se ve la respuesta correcta y, si fallaste, la opción que elegiste. |
| ![Estadísticas](docs/screenshots/estadisticas.jpg) **Estadísticas** — desglose por categoría y dificultad, calculado con `GROUP BY` / `HAVING` / `JOIN`s reales sobre PostgreSQL. | |

---

## Arquitectura

```
React (Vite + TypeScript)
        ↓ HTTP / fetch
Node / Express (TypeScript)
        ↓
Controllers → Services → Repositories
        ↓ SQL parametrizado
PostgreSQL (Neon, en producción)
```

En local, los tres servicios corren en Docker (`docker-compose.yml`). En producción, todo se despliega junto en Vercel: el backend Express se expone como una única función serverless (`api/[...all].ts`) y la base de datos es Neon Postgres (PostgreSQL gestionado, vía Vercel Marketplace).

**Autenticación**: JWT. `POST /api/auth/register` y `/login` devuelven un token; el resto de rutas de interviews/statistics lo exigen vía middleware `requireAuth`, y `req.userId` se usa para que cada usuario solo vea sus propias entrevistas y estadísticas — nunca datos de otra cuenta.

**Internacionalización**: toda la interfaz (menús, botones, mensajes) y el contenido de las 280 preguntas (título, descripción y las 3 opciones) están traducidos a inglés y español. El selector `EN / ES` de la barra superior cambia ambos a la vez.

**Separación de responsabilidades**: `Route → Controller → Service → Repository → Database`. El SQL **nunca** aparece en controllers ni services; los controllers **nunca** acceden a la base de datos directamente. Todas las consultas usan parámetros (`$1`, `$2`) para prevenir SQL injection.

### Estructura del proyecto

```
interviewlab/
├── vercel.json                # Rewrites de producción (API + SPA)
├── docker-compose.yml         # Stack local: postgres + backend + frontend
├── database/
│   └── init.sql               # Schema + seed data (280 preguntas, 14 categorías)
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts           # Entry point (Express app)
│   │   ├── config/db.ts       # Pool de conexión a PostgreSQL
│   │   ├── types/index.ts     # Tipos de dominio
│   │   ├── repositories/      # SQL parametrizado
│   │   ├── services/          # Lógica de negocio
│   │   ├── controllers/       # HTTP handlers (finos)
│   │   ├── routes/            # Routers de Express
│   │   ├── middleware/
│   │   │   ├── auth.ts        # requireAuth / attachUser (JWT)
│   │   │   └── errorHandler.ts
│   │   └── utils/sortBy.ts
│   └── tests/
├── src/                       # Frontend (usado por Vercel)
│   ├── App.tsx                # Router
│   ├── auth/                  # AuthContext, ProtectedRoute
│   ├── i18n/                  # Textos EN/ES + localización de preguntas
│   ├── components/
│   ├── pages/
│   ├── services/               # api.ts (cliente HTTP + fallback a mock data)
│   └── types/
└── frontend/                  # Espejo de src/ para el build de Docker (mismo código)
```

---

## Cómo arrancar en local

```bash
# 1. Situarse en el directorio del proyecto
cd interviewlab

# 2. Arrancar todos los servicios
docker compose up -d

# 3. Verificar que están corriendo
docker ps
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |

Parar el proyecto: `docker compose down` (añade `-v` para borrar también los datos y partir de cero).

### Páginas del frontend

| Página | Ruta | Requiere sesión |
|--------|------|:---:|
| Panel | `/dashboard` | Sí |
| Preguntas | `/questions` | No |
| Entrevistas | `/interviews` | Sí |
| Estadísticas | `/statistics` | Sí |
| Simulación | `/simulation` | No (pero solo guarda el resultado si has iniciado sesión) |
| Iniciar sesión | `/login` | — |

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) |
| GET | `/api/auth/me` | Usuario autenticado actual |
| GET | `/api/questions` | Listar preguntas (filtros: `?category=`, `?difficulty=`, `?search=`) |
| GET | `/api/questions/:id` | Obtener una pregunta |
| POST | `/api/questions` | Crear pregunta |
| PUT | `/api/questions/:id` | Actualizar pregunta |
| DELETE | `/api/questions/:id` | Eliminar pregunta |
| GET | `/api/categories` | Listar categorías |
| GET | `/api/interviews` | Listar **tus** entrevistas (requiere sesión) |
| GET | `/api/interviews/:id` | Detalle de entrevista con preguntas |
| POST | `/api/interviews` | Crear entrevista |
| POST | `/api/interviews/:id/questions` | Añadir pregunta a entrevista |
| DELETE | `/api/interviews/:id/questions/:questionId` | Quitar pregunta de entrevista |
| PUT | `/api/interviews/:id/questions/:questionId/answer` | Guardar correcto/incorrecto + la opción elegida |
| PUT | `/api/interviews/:id/status` | Cambiar estado (`scheduled` / `in_progress` / `completed`) |
| GET | `/api/statistics` | Tus estadísticas (requiere sesión) |
| GET | `/api/dashboard` | Panel (requiere sesión) |

---

## Tests

```bash
cd backend && npm test    # sortBy — función genérica con keyof (5 tests)
cd frontend && npm test   # sortBy — función genérica con keyof (6 tests)
```

---

## Seguridad y calidad

- **SQL injection**: todas las consultas usan parámetros (`$1`, `$2`, ...). Nunca concatenación de strings.
- **Auth**: JWT + bcrypt para el hash de contraseñas. Cada entrevista y respuesta queda ligada al `user_id` de quien la creó.
- **CORS**: configurable via `CORS_ORIGIN` en variables de entorno.
- **Validación de inputs**: `validateRequired()` en controllers.
- **HTTP status codes**: 200, 201, 204, 400, 401, 404, 500.
- **Variables de entorno**: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc. Sin secretos hardcodeados.
- **Sin ORM**: SQL real y legible en los repositories.
- **TypeScript estricto**: `strict: true` en frontend y backend.
