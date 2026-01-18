# Viral Academy

Academia digital de alto rendimiento enfocada en educación práctica, marketing digital, inteligencia artificial, mentalidad y negocios digitales.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5
- **Pagos**: Stripe
- **Animaciones**: Framer Motion

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase
- Cuenta en Stripe

## 🛠️ Instalación

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/viral-academy.git
cd viral-academy
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales.

### 3. Configurar la base de datos

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 4. Iniciar desarrollo

```bash
pnpm dev
```

## 👤 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@viralacademy.com | admin123 |
| Mentor | leo@viralacademy.com | mentor123 |
| Estudiante | estudiante@demo.com | student123 |

## 📜 Scripts

```bash
pnpm dev          # Desarrollo
pnpm build        # Build producción
pnpm db:generate  # Generar Prisma
pnpm db:push      # Sync schema
pnpm db:seed      # Poblar DB
pnpm db:studio    # Prisma Studio
```

## 🎨 Design System

- **Primary**: #90178E (Magenta)
- **Accent**: #C4F010 (Lime)
- **Background**: #070A10 (Dark)
- **Font**: Geist Sans

## 📁 Estructura

```
src/
├── app/           # Rutas
├── components/    # Componentes
├── lib/           # Utilidades
├── config/        # Configuración
└── types/         # TypeScript
```

---

Desarrollado con 💜 por Leonardo Gómez Ortiz
