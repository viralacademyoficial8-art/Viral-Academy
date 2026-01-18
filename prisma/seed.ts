import { PrismaClient, Role, CourseLevel, CourseCategory, LiveType, PostCategory } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function getNextWeekday(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  targetDate.setHours(19, 0, 0, 0);
  return targetDate;
}

async function main() {
  console.log("🌱 Iniciando seed...");

  const adminPassword = await hash("admin123", 12);
  const mentorPassword = await hash("mentor123", 12);
  const studentPassword = await hash("student123", 12);

  // Usuarios
  const admin = await prisma.user.upsert({
    where: { email: "admin@viralacademy.com" },
    update: {},
    create: {
      email: "admin@viralacademy.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profile: { create: { firstName: "Admin", lastName: "VA", displayName: "Admin", onboardingDone: true } },
    },
  });

  const leo = await prisma.user.upsert({
    where: { email: "leo@viralacademy.com" },
    update: {},
    create: {
      email: "leo@viralacademy.com",
      password: mentorPassword,
      role: Role.MENTOR,
      emailVerified: new Date(),
      profile: { create: { firstName: "Leonardo", lastName: "Gómez Ortiz", displayName: "Leo Gómez", bio: "Estratega digital y mentor de viralidad.", onboardingDone: true } },
    },
  });

  const susy = await prisma.user.upsert({
    where: { email: "susy@viralacademy.com" },
    update: {},
    create: {
      email: "susy@viralacademy.com",
      password: mentorPassword,
      role: Role.MENTOR,
      emailVerified: new Date(),
      profile: { create: { firstName: "Susy", lastName: "Ponce", displayName: "Susy Ponce", bio: "Master Speaker y mentora de comunicación.", onboardingDone: true } },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "estudiante@demo.com" },
    update: {},
    create: {
      email: "estudiante@demo.com",
      password: studentPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
      profile: { create: { firstName: "Usuario", lastName: "Demo", displayName: "Usuario Demo", objective: "Aprender marketing", level: "beginner", onboardingDone: true } },
      subscription: { create: { stripeCustomerId: "cus_demo", stripeSubscriptionId: "sub_demo", status: "ACTIVE", currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
    },
  });

  console.log("✅ Usuarios creados");

  // Cursos
  const course1 = await prisma.course.upsert({
    where: { slug: "marketing-digital-desde-cero" },
    update: {},
    create: {
      slug: "marketing-digital-desde-cero",
      title: "Marketing Digital desde Cero",
      description: "Aprende los fundamentos del marketing digital.",
      shortDesc: "Domina el marketing digital.",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.MARKETING,
      mentorId: leo.id,
      published: true,
      featured: true,
      duration: 480,
      outcomes: ["Crear campañas en Meta", "Diseñar funnels", "Analizar métricas"],
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "creacion-contenido-viral" },
    update: {},
    create: {
      slug: "creacion-contenido-viral",
      title: "Creación de Contenido Viral",
      description: "Aprende a crear contenido que se comparte.",
      shortDesc: "Crea contenido viral.",
      level: CourseLevel.INTERMEDIATE,
      category: CourseCategory.CONTENT,
      mentorId: leo.id,
      published: true,
      featured: true,
      duration: 360,
      outcomes: ["Entender la viralidad", "Crear Reels efectivos", "Desarrollar tu voz"],
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "ia-para-negocios" },
    update: {},
    create: {
      slug: "ia-para-negocios",
      title: "Inteligencia Artificial para Negocios",
      description: "Usa IA para escalar tu negocio.",
      shortDesc: "IA como asistente 24/7.",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.AI,
      mentorId: leo.id,
      published: true,
      duration: 300,
      outcomes: ["Dominar ChatGPT", "Crear prompts efectivos", "Automatizar tareas"],
    },
  });

  const course4 = await prisma.course.upsert({
    where: { slug: "mentalidad-emprendedora" },
    update: {},
    create: {
      slug: "mentalidad-emprendedora",
      title: "Mentalidad Emprendedora",
      description: "Desarrolla el poder personal que necesitas.",
      shortDesc: "La base mental del éxito.",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.MINDSET,
      mentorId: susy.id,
      published: true,
      duration: 240,
      outcomes: ["Desarrollar autoconfianza", "Comunicar con poder", "Crear hábitos"],
    },
  });

  // Módulos y lecciones
  const mod1 = await prisma.module.upsert({
    where: { id: "mod1-marketing" },
    update: {},
    create: { id: "mod1-marketing", courseId: course1.id, title: "Introducción al Marketing Digital", order: 1 },
  });

  await prisma.lesson.upsert({ where: { id: "lesson1" }, update: {}, create: { id: "lesson1", moduleId: mod1.id, title: "¿Qué es el Marketing Digital?", duration: 15, order: 1, videoUrl: "https://youtube.com/watch?v=example" } });
  await prisma.lesson.upsert({ where: { id: "lesson2" }, update: {}, create: { id: "lesson2", moduleId: mod1.id, title: "El Ecosistema Digital", duration: 20, order: 2, videoUrl: "https://youtube.com/watch?v=example" } });
  await prisma.lesson.upsert({ where: { id: "lesson3" }, update: {}, create: { id: "lesson3", moduleId: mod1.id, title: "Estrategia vs Táctica", duration: 18, order: 3, videoUrl: "https://youtube.com/watch?v=example" } });

  const mod2 = await prisma.module.upsert({
    where: { id: "mod2-marketing" },
    update: {},
    create: { id: "mod2-marketing", courseId: course1.id, title: "Meta Ads: Facebook e Instagram", order: 2 },
  });

  await prisma.lesson.upsert({ where: { id: "lesson4" }, update: {}, create: { id: "lesson4", moduleId: mod2.id, title: "Configuración del Business Manager", duration: 25, order: 1, videoUrl: "https://youtube.com/watch?v=example" } });
  await prisma.lesson.upsert({ where: { id: "lesson5" }, update: {}, create: { id: "lesson5", moduleId: mod2.id, title: "Estructura de Campañas", duration: 30, order: 2, videoUrl: "https://youtube.com/watch?v=example" } });

  console.log("✅ Cursos y lecciones creados");

  // Lives
  await prisma.liveEvent.upsert({
    where: { id: "live1" },
    update: {},
    create: { id: "live1", title: "Lunes Sublimes: El poder de la comunicación", type: LiveType.MINDSET, mentorId: susy.id, scheduledAt: getNextWeekday(1), duration: 90, published: true },
  });

  await prisma.liveEvent.upsert({
    where: { id: "live2" },
    update: {},
    create: { id: "live2", title: "Miércoles Virales: IA para contenido", type: LiveType.MARKETING, mentorId: leo.id, scheduledAt: getNextWeekday(3), duration: 90, published: true },
  });

  // Replays
  await prisma.replay.upsert({
    where: { id: "replay1" },
    update: {},
    create: { id: "replay1", title: "Lunes Sublimes: Superar el miedo al rechazo", type: LiveType.MINDSET, mentorId: susy.id, videoUrl: "https://youtube.com/watch?v=example", duration: 85, recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), published: true },
  });

  await prisma.replay.upsert({
    where: { id: "replay2" },
    update: {},
    create: { id: "replay2", title: "Miércoles Virales: Meta Ads 2024", type: LiveType.MARKETING, mentorId: leo.id, videoUrl: "https://youtube.com/watch?v=example", duration: 95, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), published: true },
  });

  console.log("✅ Lives y replays creados");

  // Comunidad
  await prisma.communityCategory.upsert({ where: { slug: "anuncios" }, update: {}, create: { slug: "anuncios", name: "Anuncios", icon: "megaphone", order: 1 } });
  await prisma.communityCategory.upsert({ where: { slug: "preguntas" }, update: {}, create: { slug: "preguntas", name: "Preguntas", icon: "help-circle", order: 2 } });
  await prisma.communityCategory.upsert({ where: { slug: "wins" }, update: {}, create: { slug: "wins", name: "Wins", icon: "trophy", order: 3 } });
  await prisma.communityCategory.upsert({ where: { slug: "recursos" }, update: {}, create: { slug: "recursos", name: "Recursos", icon: "folder", order: 4 } });
  await prisma.communityCategory.upsert({ where: { slug: "general" }, update: {}, create: { slug: "general", name: "General", icon: "message-circle", order: 5 } });

  console.log("✅ Comunidad creada");

  // Recursos
  await prisma.resource.upsert({ where: { id: "res1" }, update: {}, create: { id: "res1", title: "Plantilla de Calendario de Contenidos", fileUrl: "/resources/calendario.xlsx", fileType: "xlsx", courseId: course2.id } });
  await prisma.resource.upsert({ where: { id: "res2" }, update: {}, create: { id: "res2", title: "Guía de Meta Ads 2024", fileUrl: "/resources/meta-ads.pdf", fileType: "pdf", courseId: course1.id } });
  await prisma.resource.upsert({ where: { id: "res3" }, update: {}, create: { id: "res3", title: "Pack de Prompts para IA", fileUrl: "/resources/prompts.pdf", fileType: "pdf", courseId: course3.id } });

  console.log("✅ Recursos creados");

  // Enrollment y progreso
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: { userId: student.id, courseId: course1.id },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: "lesson1" } },
    update: {},
    create: { userId: student.id, lessonId: "lesson1", completed: true, completedAt: new Date(), watchTime: 900 },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: "lesson2" } },
    update: {},
    create: { userId: student.id, lessonId: "lesson2", completed: true, completedAt: new Date(), watchTime: 1200 },
  });

  console.log("✅ Progreso creado");

  console.log("\n🎉 Seed completado!");
  console.log("\n📧 Credenciales:");
  console.log("   Admin: admin@viralacademy.com / admin123");
  console.log("   Mentor: leo@viralacademy.com / mentor123");
  console.log("   Estudiante: estudiante@demo.com / student123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
