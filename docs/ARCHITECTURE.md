# Viral Academy - Arquitectura del Sistema

## 1. Visión General

Viral Academy es una plataforma educativa premium con membresía mensual que ofrece:
- Cursos modulares con progreso persistente
- Clases en vivo semanales (Lunes: Mentalidad, Miércoles: Marketing/IA)
- Comunidad activa tipo foro
- Sistema de certificados verificables
- Panel administrativo completo

## 2. Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Componentes**: shadcn/ui (personalizado)
- **Animaciones**: Framer Motion
- **Estado**: Zustand + React Query

### Backend
- **Runtime**: Node.js (Edge compatible)
- **API**: Next.js API Routes + Server Actions
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5 (Auth.js)

### Infraestructura
- **Hosting**: Vercel
- **Base de Datos**: Supabase (PostgreSQL)
- **Pagos**: Stripe (Checkout + Webhooks)
- **Almacenamiento**: Supabase Storage / Cloudinary
- **Analytics**: Vercel Analytics + PostHog (opcional)

## 3. Módulos del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIRAL ACADEMY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   PUBLIC     │  │    AUTH      │  │   BILLING    │          │
│  │   SITE       │  │   SYSTEM     │  │   (STRIPE)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    APP (PROTECTED)                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │DASHBOARD│ │ CURSOS  │ │  LIVES  │ │COMUNIDAD│        │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │  │
│  │  │RECURSOS │ │CERTIFIC.│ │ PERFIL  │                    │  │
│  │  └─────────┘ └─────────┘ └─────────┘                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  MENTOR / ADMIN PANEL                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│  │  │  CRUD   │ │ LIVES   │ │USUARIOS │ │ANALYTICS│        │  │
│  │  │ CURSOS  │ │ MANAGE  │ │ MANAGE  │ │         │        │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Roles y Permisos

| Permiso                    | Guest | Student | Mentor | Admin |
|---------------------------|-------|---------|--------|-------|
| Ver landing               | ✅    | ✅      | ✅     | ✅    |
| Ver catálogo preview      | ✅    | ✅      | ✅     | ✅    |
| Registrarse               | ✅    | -       | -      | -     |
| Ver dashboard             | ❌    | ✅      | ✅     | ✅    |
| Acceder a cursos          | ❌    | ✅*     | ✅     | ✅    |
| Ver lives/replays         | ❌    | ✅*     | ✅     | ✅    |
| Participar en comunidad   | ❌    | ✅*     | ✅     | ✅    |
| Descargar recursos        | ❌    | ✅*     | ✅     | ✅    |
| Obtener certificados      | ❌    | ✅*     | ✅     | ✅    |
| Crear/editar cursos       | ❌    | ❌      | ✅     | ✅    |
| Gestionar lives           | ❌    | ❌      | ✅     | ✅    |
| Moderar comunidad         | ❌    | ❌      | ✅     | ✅    |
| Ver analytics             | ❌    | ❌      | ✅     | ✅    |
| Gestionar usuarios        | ❌    | ❌      | ❌     | ✅    |
| Gestionar membresías      | ❌    | ❌      | ❌     | ✅    |
| Auditoría                 | ❌    | ❌      | ❌     | ✅    |
| Settings plataforma       | ❌    | ❌      | ❌     | ✅    |

*Requiere membresía activa

## 5. Mapa de Rutas Completo

### PÚBLICO (marketing site)
- `/` - Home Landing
- `/viral-academy` - Qué es Viral Academy
- `/mentores` - Mentores: Leo y Susy
- `/membresia` - Pricing
- `/cursos` - Catálogo público con previews
- `/cursos/[slug]` - Página pública del curso
- `/eventos` - Eventos presenciales
- `/faq` - Preguntas frecuentes
- `/contacto` - Formulario contacto
- `/legal/terminos` - Términos
- `/legal/privacidad` - Privacidad
- `/verificar/[code]` - Verificación de certificados

### AUTH
- `/auth/login` - Login
- `/auth/registro` - Registro
- `/auth/recuperar` - Recuperar contraseña
- `/auth/nuevo-password` - Reset password

### APP (PROTEGIDO)
- `/app` - Redirect según rol
- `/app/onboarding` - Onboarding
- `/app/dashboard` - Dashboard alumno
- `/app/perfil` - Perfil y ajustes
- `/app/notificaciones` - Notificaciones
- `/app/cursos` - Catálogo interno
- `/app/cursos/[slug]` - Detalle curso
- `/app/cursos/[slug]/learn` - Player de lecciones
- `/app/buscar` - Búsqueda global
- `/app/recursos` - Biblioteca de recursos
- `/app/lives` - Calendario de lives
- `/app/replays` - Biblioteca de replays
- `/app/certificados` - Certificados del alumno
- `/app/comunidad` - Feed comunidad
- `/app/billing` - Estado membresía

### MENTOR
- `/app/mentor` - Panel mentor
- `/app/mentor/cursos` - Gestión de cursos
- `/app/mentor/lives` - Gestión de lives
- `/app/mentor/comunidad` - Moderación
- `/app/mentor/analytics` - Analytics

### ADMIN
- `/app/admin` - Panel admin
- `/app/admin/usuarios` - Gestión usuarios
- `/app/admin/membresias` - Membresías
- `/app/admin/cursos` - Cursos
- `/app/admin/eventos` - Eventos
- `/app/admin/auditoria` - Audit logs
- `/app/admin/settings` - Configuración

## 6. API Endpoints

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/auth/forgot-password` | Solicitar reset |
| POST | `/api/auth/reset-password` | Reset password |

### Webhooks
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe events |

### Courses
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/courses` | Listar cursos |
| GET | `/api/courses/[slug]` | Detalle curso |
| POST | `/api/courses` | Crear curso (mentor+) |
| PATCH | `/api/courses/[id]` | Actualizar curso |
| DELETE | `/api/courses/[id]` | Eliminar curso |

### Progress
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/progress` | Progreso del usuario |
| POST | `/api/progress/lesson` | Marcar lección completada |
| GET | `/api/progress/course/[id]` | Progreso de curso |

### Lives
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/lives` | Listar lives |
| GET | `/api/lives/[id]` | Detalle live |
| POST | `/api/lives` | Crear live (mentor+) |

### Certificates
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/certificates` | Certificados del usuario |
| POST | `/api/certificates/generate` | Generar certificado |
| GET | `/api/certificates/verify/[code]` | Verificar certificado |

### Community
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/community/posts` | Listar posts |
| POST | `/api/community/posts` | Crear post |
| POST | `/api/community/posts/[id]/comments` | Comentar |
| POST | `/api/community/posts/[id]/like` | Like |

## 7. Eventos de Analytics

```typescript
// Autenticación
'sign_up' - Registro completado
'login' - Login exitoso
'onboarding_complete' - Onboarding terminado

// Membresía
'purchase_start' - Inicio checkout
'purchase_success' - Compra exitosa
'purchase_cancel' - Checkout abandonado

// Cursos
'course_view' - Vista de curso
'lesson_start' - Inicio de lección
'lesson_complete' - Lección completada
'course_complete' - Curso completado

// Lives
'live_view' - Vista de live
'replay_view' - Vista de replay

// Certificados
'certificate_earned' - Certificado obtenido
'certificate_download' - Descarga PDF
```

## 8. Roadmap

### MVP (Semanas 1-6)
- ✅ Setup proyecto Next.js + TS + Tailwind + shadcn
- ✅ Design System completo
- ✅ Base de datos Prisma + Supabase
- ✅ Auth con NextAuth.js
- ✅ Layouts y navegación
- ✅ Landing home completa
- ✅ Dashboard alumno
- ✅ Catálogo de cursos
- ⏳ Player de lecciones
- ⏳ Sistema de progreso
- ⏳ Lives y replays
- ⏳ Certificados
- ⏳ Comunidad MVP
- ⏳ Billing (Stripe integration)
- ⏳ Panel mentor/admin

### Fase 2 (Post-MVP)
- Membresía anual
- Coach IA integrado
- Quizzes avanzados
- Gamificación
- App móvil
- Sistema de afiliados

## 9. Definition of Done (MVP)

### Funcional
- [ ] Auth completo
- [ ] Onboarding funcional
- [ ] Landing y páginas públicas
- [ ] Catálogo de cursos con filtros
- [ ] Player de lecciones con progreso
- [ ] Sistema de lives y replays
- [ ] Generación de certificados PDF
- [ ] Comunidad MVP
- [ ] Integración Stripe completa
- [ ] Panel mentor/admin básico

### Técnico
- [ ] Responsive perfecto (mobile-first)
- [ ] Dark/Light mode
- [ ] Performance: LCP < 2.5s
- [ ] SEO básico implementado
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Protección de rutas

### Deployment
- [ ] Variables de entorno configuradas
- [ ] Vercel deployment
- [ ] Supabase producción
- [ ] Stripe producción
- [ ] Dominio y SSL activo
