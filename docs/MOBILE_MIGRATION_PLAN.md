# Plan de Migración a Aplicaciones Móviles - Viral Academy

## Resumen Ejecutivo

Este documento detalla los requerimientos tecnológicos, opciones de desarrollo, y estimaciones para migrar Viral Academy a aplicaciones móviles nativas para iOS y Android.

---

## 1. Estado Actual del Proyecto

### Stack Tecnológico Actual
| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16.1.3 + React 19 |
| Backend/API | Next.js API Routes (50 endpoints) |
| Base de Datos | PostgreSQL (Supabase) + Prisma ORM |
| Autenticación | NextAuth.js v5 (JWT + Google OAuth) |
| Pagos | Stripe |
| Storage | Vercel Blob |
| Email | Resend |
| UI | Tailwind CSS + shadcn/ui (Radix) |

### Métricas del Proyecto
- **202 archivos TypeScript/TSX**
- **~34,108 líneas de código**
- **50 API endpoints REST**
- **48 componentes React**
- **25 modelos de base de datos**
- **20+ páginas/vistas principales**

---

## 2. Opciones de Desarrollo Móvil

### Opción A: React Native (RECOMENDADA)

**Ventajas:**
- Reutiliza conocimiento de React existente
- Código compartido entre iOS y Android (~70-80%)
- Gran ecosistema de librerías
- Hot reload para desarrollo rápido
- Expo simplifica el desarrollo y deployment

**Desventajas:**
- Rendimiento ligeramente inferior a nativo puro
- Algunas funcionalidades requieren código nativo

**Stack Propuesto:**
```
- Framework: React Native + Expo
- UI: React Native Paper o NativeBase
- Navegación: React Navigation
- Estado: Zustand (ya usado en web)
- Queries: TanStack Query (ya usado en web)
- Formularios: React Hook Form (ya usado en web)
- Autenticación: Expo Auth Session + API existente
- Pagos: Stripe React Native SDK
- Video: react-native-video
- Storage: expo-file-system
```

### Opción B: Flutter

**Ventajas:**
- Excelente rendimiento
- UI consistente entre plataformas
- Un solo codebase para iOS y Android
- Hot reload

**Desventajas:**
- Requiere aprender Dart (nuevo lenguaje)
- Equipo actual no tiene experiencia
- No reutiliza código TypeScript existente

### Opción C: Desarrollo Nativo Puro

**Ventajas:**
- Mejor rendimiento posible
- Acceso completo a APIs nativas
- Mejor experiencia de usuario

**Desventajas:**
- Requiere dos equipos (iOS Swift, Android Kotlin)
- Mayor tiempo de desarrollo (x2)
- Mayor costo de mantenimiento

### Opción D: PWA (Progressive Web App)

**Ventajas:**
- Mínimo desarrollo adicional
- Un solo codebase
- Funciona sin instalación

**Desventajas:**
- Experiencia inferior a apps nativas
- Sin acceso a tiendas de apps
- Limitaciones en notificaciones push iOS
- No cumple expectativas de usuarios móviles

---

## 3. Recomendación: React Native + Expo

### Justificación
1. **Máxima reutilización**: El equipo ya conoce React, TypeScript, Zustand, React Query
2. **Costo-beneficio óptimo**: Un solo codebase para ambas plataformas
3. **Tiempo de desarrollo reducido**: 40-50% más rápido que nativo puro
4. **Ecosistema maduro**: Expo simplifica builds, updates OTA, y deployment

---

## 4. Arquitectura de la Solución Móvil

### 4.1 Backend (Cambios Mínimos Requeridos)

El backend actual está bien preparado para móvil. Cambios necesarios:

```
CAMBIOS EN BACKEND
├── Nuevos endpoints (5-10%)
│   ├── /api/mobile/device-token     # Para push notifications
│   ├── /api/mobile/app-version      # Verificar versión de app
│   └── /api/mobile/deep-links       # Manejo de deep links
│
├── Modificaciones (5%)
│   ├── Headers CORS para apps móviles
│   ├── Rate limiting específico para móvil
│   └── Compresión de responses para datos móviles
│
└── Servicios nuevos
    ├── Firebase Cloud Messaging (push notifications)
    └── App Store Connect / Google Play Console APIs
```

### 4.2 Frontend Móvil (Desarrollo Nuevo)

```
ESTRUCTURA APP MÓVIL
src/
├── app/                        # Navegación y pantallas
│   ├── (tabs)/                 # Tab navigator principal
│   │   ├── dashboard/          # Dashboard
│   │   ├── courses/            # Cursos
│   │   ├── community/          # Comunidad
│   │   ├── lives/              # Lives y replays
│   │   └── profile/            # Perfil
│   ├── auth/                   # Flujo de autenticación
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── course/                 # Detalle de curso
│   │   ├── [id].tsx
│   │   └── lesson/[id].tsx     # Reproductor de lecciones
│   └── onboarding/             # Onboarding
│
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Componentes base
│   ├── video/                  # Reproductor de video
│   ├── cards/                  # Tarjetas de contenido
│   └── forms/                  # Formularios
│
├── hooks/                      # Custom hooks
├── services/                   # API calls
├── stores/                     # Zustand stores
├── types/                      # TypeScript types
└── utils/                      # Utilidades
```

### 4.3 Funcionalidades por Fase

#### Fase 1: MVP (Core)
- Login/Registro (email + Google)
- Dashboard con cursos
- Lista de cursos y búsqueda
- Reproductor de video (YouTube/Vimeo)
- Progreso de lecciones
- Perfil básico

#### Fase 2: Engagement
- Comunidad (posts, comentarios, likes)
- Sistema de notificaciones push
- Lives y replays
- Favoritos/bookmarks
- Notas en lecciones

#### Fase 3: Monetización
- Integración Stripe (suscripciones)
- In-App Purchases (iOS/Android)
- Certificados (visualización)
- Recursos descargables

#### Fase 4: Avanzado
- Modo offline (descarga de lecciones)
- Certificados con descarga PDF
- Quizzes interactivos
- Deep linking completo

---

## 5. Requerimientos Tecnológicos Detallados

### 5.1 Equipo de Desarrollo

| Rol | Cantidad | Experiencia Requerida |
|-----|----------|----------------------|
| React Native Developer (Senior) | 1-2 | 3+ años React Native, Expo |
| Backend Developer | 0.5 | Ajustes a API existente |
| UI/UX Designer (Móvil) | 1 | Diseño iOS/Android guidelines |
| QA Engineer | 1 | Testing móvil, automatización |
| DevOps | 0.5 | CI/CD móvil, stores |

**Equipo mínimo recomendado: 3-4 personas**

### 5.2 Infraestructura Nueva

```
SERVICIOS ADICIONALES REQUERIDOS
├── Firebase
│   ├── Cloud Messaging (Push Notifications)  ~$0-25/mes
│   ├── Analytics                             Gratis
│   └── Crashlytics                           Gratis
│
├── App Stores
│   ├── Apple Developer Account               $99/año
│   └── Google Play Developer Account         $25 único
│
├── CI/CD Móvil
│   ├── Expo EAS Build                        $0-99/mes
│   └── App Center (Microsoft) [alternativa]  Gratis-99/mes
│
├── Monitoreo
│   ├── Sentry (ya en uso)                    Incluido
│   └── App Store Analytics                   Incluido
│
└── Testing
    ├── Dispositivos físicos (3-5)            $1,500-3,000
    └── BrowserStack/Sauce Labs (opcional)    $29-199/mes
```

**Costo mensual adicional estimado: $50-200 USD**

### 5.3 Herramientas de Desarrollo

```
STACK DE DESARROLLO
├── IDE
│   ├── VS Code (ya en uso)
│   ├── Xcode (para iOS, Mac requerido)
│   └── Android Studio (para Android)
│
├── Expo CLI
│   ├── expo-cli
│   ├── eas-cli (builds y submissions)
│   └── expo-dev-client
│
├── Testing
│   ├── Jest (ya en uso)
│   ├── React Native Testing Library
│   └── Detox (E2E testing)
│
└── Simuladores/Emuladores
    ├── iOS Simulator (Mac)
    └── Android Emulator
```

---

## 6. Estimación de Tiempo

### Escenario 1: Equipo Pequeño (2-3 devs)

| Fase | Duración | Funcionalidades |
|------|----------|-----------------|
| Setup + Arquitectura | 2 semanas | Proyecto, navegación, autenticación |
| Fase 1: MVP | 8-10 semanas | Core: cursos, video, progreso |
| Fase 2: Engagement | 6-8 semanas | Comunidad, notificaciones, lives |
| Fase 3: Monetización | 4-6 semanas | Stripe, IAP, certificados |
| QA + Polish | 4 semanas | Testing, bugs, optimización |
| App Store Submission | 2 semanas | Review process |

**Total: 26-32 semanas (6-8 meses)**

### Escenario 2: Equipo Mediano (4-5 devs)

| Fase | Duración | Notas |
|------|----------|-------|
| Setup + MVP | 6-8 semanas | Desarrollo paralelo |
| Engagement + Monetización | 6-8 semanas | Features en paralelo |
| QA + Submission | 3-4 semanas | Testing exhaustivo |

**Total: 15-20 semanas (4-5 meses)**

### Escenario 3: MVP Rápido (2 devs, scope reducido)

| Fase | Duración | Scope |
|------|----------|-------|
| MVP Básico | 8-10 semanas | Solo cursos + video + auth |
| Store Submission | 2 semanas | Review |

**Total: 10-12 semanas (2.5-3 meses)**

---

## 7. Presupuesto Estimado

### Costos de Desarrollo (USD)

| Escenario | Equipo | Duración | Costo Estimado* |
|-----------|--------|----------|-----------------|
| Completo (2-3 devs) | 2-3 | 6-8 meses | $80,000 - $150,000 |
| Acelerado (4-5 devs) | 4-5 | 4-5 meses | $100,000 - $180,000 |
| MVP Básico (2 devs) | 2 | 2.5-3 meses | $30,000 - $50,000 |

*Basado en tarifas de desarrolladores React Native mid-senior ($40-80/hora)

### Costos Recurrentes Anuales

| Concepto | Costo Anual |
|----------|-------------|
| Apple Developer | $99 |
| Google Play | $25 (único) |
| Firebase/Push | $0-300 |
| EAS Build (Expo) | $0-1,200 |
| Monitoreo | $0-500 |
| Mantenimiento (20% dev) | $10,000-30,000 |

**Costo anual de operación: $10,000 - $32,000 USD**

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Rechazo en App Store | Media | Alto | Seguir guidelines estrictamente |
| Rendimiento de video | Media | Medio | Usar SDKs nativos de video |
| Integración Stripe móvil | Baja | Alto | Documentación extensa disponible |
| Compatibilidad dispositivos | Media | Medio | Testing en dispositivos reales |
| Actualizaciones de Expo/RN | Baja | Bajo | Expo maneja compatibilidad |

---

## 9. Alternativa: Desarrollo en Fases con Validación

### Fase Piloto (8-10 semanas, ~$30-40K)
1. Desarrollar MVP solo iOS (React Native)
2. TestFlight con 50-100 usuarios beta
3. Validar métricas de engagement
4. Decidir continuar basado en datos

### Expansión (si la piloto es exitosa)
1. Android version
2. Features adicionales
3. Optimizaciones basadas en feedback

---

## 10. Checklist de Preparación

### Antes de Comenzar

- [ ] Definir alcance exacto de MVP
- [ ] Diseños UI/UX móviles aprobados
- [ ] Documentar API endpoints actuales
- [ ] Configurar cuentas de desarrollador (Apple/Google)
- [ ] Definir equipo de desarrollo
- [ ] Establecer proceso de CI/CD
- [ ] Definir métricas de éxito

### Requisitos de Infraestructura

- [ ] Mac para desarrollo iOS (requerido)
- [ ] Cuenta Apple Developer ($99/año)
- [ ] Cuenta Google Play Console ($25)
- [ ] Proyecto Firebase configurado
- [ ] Ambiente de staging para API

### Documentación Necesaria

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Guía de estilo de código
- [ ] Flujos de autenticación documentados
- [ ] Especificación de push notifications

---

## 11. Conclusión y Recomendación

### Recomendación Final

**Opción más equilibrada**: React Native + Expo con desarrollo en fases

**Justificación**:
1. Reutiliza el conocimiento existente de React/TypeScript
2. Un solo codebase para iOS y Android
3. Backend actual necesita cambios mínimos
4. Expo simplifica enormemente builds y deployment
5. Costo-beneficio óptimo

### Próximos Pasos Sugeridos

1. **Semana 1-2**: Definir MVP exacto y crear diseños móviles
2. **Semana 3**: Configurar infraestructura (cuentas, Firebase)
3. **Semana 4**: Iniciar desarrollo con equipo seleccionado
4. **Semana 10-12**: Beta testing con usuarios reales
5. **Semana 14-16**: Lanzamiento en tiendas

---

## Apéndice: Componentes a Desarrollar para Móvil

### Componentes Nuevos Requeridos (estimado)

| Categoría | Componentes Web | Componentes Móvil Nuevos |
|-----------|-----------------|--------------------------|
| UI Base | 18 (shadcn/ui) | 15-20 (RN Paper) |
| Navegación | 5 | 8-10 |
| Video Players | 2 | 2 (nativos) |
| Formularios | 10+ | 8-10 |
| Cards/Lists | 15+ | 12-15 |
| Modales | 8+ | 6-8 |
| Autenticación | 4 | 4-5 |

**Total estimado: 55-70 componentes móviles nuevos**

---

*Documento creado: Febrero 2026*
*Versión: 1.0*
