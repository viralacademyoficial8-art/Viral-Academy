import { PrismaClient, Role, CourseLevel, CourseCategory, LiveType, PostCategory } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function getNextWeekday(dayOfWeek: number, weeksAhead: number = 0): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7));
  targetDate.setHours(19, 0, 0, 0);
  return targetDate;
}

function getPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function main() {
  console.log("🌱 Iniciando seed de Viral Academy...\n");

  const adminPassword = await hash("admin123", 12);
  const mentorPassword = await hash("mentor123", 12);
  const studentPassword = await hash("student123", 12);

  // ============================================
  // USUARIOS
  // ============================================
  console.log("👤 Creando usuarios...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@viralacademy.com" },
    update: {},
    create: {
      email: "admin@viralacademy.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: "Admin",
          lastName: "Viral Academy",
          displayName: "Admin VA",
          onboardingDone: true,
        },
      },
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
      profile: {
        create: {
          firstName: "Leonardo",
          lastName: "Gómez Ortiz",
          displayName: "Leo Gómez",
          bio: "Estratega digital, experto en viralidad y fundador de Viral Academy. Ha ayudado a miles de emprendedores a escalar sus negocios usando marketing digital y redes sociales.",
          avatar: "/avatars/leo.jpg",
          onboardingDone: true,
        },
      },
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
      profile: {
        create: {
          firstName: "Susy",
          lastName: "Ponce",
          displayName: "Susy Ponce",
          bio: "Master Speaker, mentora de comunicación y desarrollo personal. Especialista en ayudar a emprendedores a desarrollar su poder personal y comunicación efectiva.",
          avatar: "/avatars/susy.jpg",
          onboardingDone: true,
        },
      },
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
      profile: {
        create: {
          firstName: "Usuario",
          lastName: "Demo",
          displayName: "Usuario Demo",
          objective: "Aprender marketing digital",
          level: "beginner",
          onboardingDone: true,
        },
      },
      subscription: {
        create: {
          stripeCustomerId: "cus_demo_123",
          stripeSubscriptionId: "sub_demo_123",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("   ✅ Usuarios creados\n");

  // ============================================
  // CURSOS
  // ============================================
  console.log("📚 Creando cursos...");

  // CURSO 1: Marketing Digital desde Cero
  const marketingCourse = await prisma.course.upsert({
    where: { slug: "marketing-digital-desde-cero" },
    update: {},
    create: {
      slug: "marketing-digital-desde-cero",
      title: "Marketing Digital desde Cero",
      description: "El curso más completo para dominar el marketing digital. Aprenderás desde los fundamentos hasta estrategias avanzadas de Meta Ads, Google Ads, email marketing y automatizaciones. Perfecto para emprendedores que quieren llevar su negocio al siguiente nivel.",
      shortDesc: "Domina el marketing digital y escala tu negocio",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.MARKETING,
      mentorId: leo.id,
      published: true,
      featured: true,
      order: 1,
      duration: 720,
      outcomes: [
        "Crear campañas rentables en Meta Ads",
        "Diseñar funnels de venta efectivos",
        "Dominar Google Ads desde cero",
        "Implementar email marketing automatizado",
        "Analizar métricas y optimizar resultados",
      ],
    },
  });

  // CURSO 2: Creación de Contenido Viral
  const contentCourse = await prisma.course.upsert({
    where: { slug: "creacion-contenido-viral" },
    update: {},
    create: {
      slug: "creacion-contenido-viral",
      title: "Creación de Contenido Viral",
      description: "Descubre los secretos detrás del contenido que se comparte millones de veces. Aprenderás la psicología de la viralidad, técnicas de storytelling y cómo crear Reels, TikToks y contenido que conecte con tu audiencia.",
      shortDesc: "Crea contenido que se comparte solo",
      level: CourseLevel.INTERMEDIATE,
      category: CourseCategory.CONTENT,
      mentorId: leo.id,
      published: true,
      featured: true,
      order: 2,
      duration: 540,
      outcomes: [
        "Entender la psicología de la viralidad",
        "Crear Reels y TikToks efectivos",
        "Dominar técnicas de storytelling",
        "Desarrollar tu voz única de marca",
        "Planificar un calendario de contenido",
      ],
    },
  });

  // CURSO 3: IA para Negocios
  const aiCourse = await prisma.course.upsert({
    where: { slug: "ia-para-negocios" },
    update: {},
    create: {
      slug: "ia-para-negocios",
      title: "Inteligencia Artificial para Negocios",
      description: "Aprende a usar la IA como tu asistente personal 24/7. Desde ChatGPT hasta herramientas de automatización, descubre cómo multiplicar tu productividad y escalar tu negocio con inteligencia artificial.",
      shortDesc: "Tu asistente digital que trabaja 24/7",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.AI,
      mentorId: leo.id,
      published: true,
      featured: false,
      order: 3,
      duration: 420,
      outcomes: [
        "Dominar ChatGPT y Claude para negocios",
        "Crear prompts efectivos para cualquier tarea",
        "Automatizar tareas repetitivas",
        "Generar contenido con IA",
        "Integrar IA en tu flujo de trabajo",
      ],
    },
  });

  // CURSO 4: Mentalidad Emprendedora
  const mindsetCourse = await prisma.course.upsert({
    where: { slug: "mentalidad-emprendedora" },
    update: {},
    create: {
      slug: "mentalidad-emprendedora",
      title: "Mentalidad Emprendedora",
      description: "La base de todo éxito es la mentalidad correcta. En este curso desarrollarás la confianza, disciplina y claridad mental que necesitas para alcanzar tus metas más ambiciosas.",
      shortDesc: "Desarrolla el mindset del éxito",
      level: CourseLevel.BEGINNER,
      category: CourseCategory.MINDSET,
      mentorId: susy.id,
      published: true,
      featured: true,
      order: 4,
      duration: 360,
      outcomes: [
        "Desarrollar autoconfianza inquebrantable",
        "Superar el miedo al fracaso y al rechazo",
        "Crear hábitos de alto rendimiento",
        "Comunicar con poder e influencia",
        "Establecer y alcanzar metas ambiciosas",
      ],
    },
  });

  // CURSO 5: Automatizaciones y Funnels
  const automationCourse = await prisma.course.upsert({
    where: { slug: "automatizaciones-y-funnels" },
    update: {},
    create: {
      slug: "automatizaciones-y-funnels",
      title: "Automatizaciones y Funnels de Venta",
      description: "Crea sistemas de venta que trabajan para ti mientras duermes. Aprende a diseñar funnels efectivos y automatizar todo tu proceso de marketing y ventas.",
      shortDesc: "Vende en automático 24/7",
      level: CourseLevel.ADVANCED,
      category: CourseCategory.AUTOMATION,
      mentorId: leo.id,
      published: true,
      featured: false,
      order: 5,
      duration: 480,
      outcomes: [
        "Diseñar funnels de venta completos",
        "Automatizar email marketing",
        "Crear secuencias de WhatsApp",
        "Integrar herramientas con Zapier",
        "Optimizar conversiones",
      ],
    },
  });

  // CURSO 6: Marca Personal
  const brandCourse = await prisma.course.upsert({
    where: { slug: "marca-personal-magnetica" },
    update: {},
    create: {
      slug: "marca-personal-magnetica",
      title: "Marca Personal Magnética",
      description: "Construye una marca personal que atraiga clientes y oportunidades. Aprende a posicionarte como experto, crear tu propuesta de valor única y destacar en tu industria.",
      shortDesc: "Conviértete en referente de tu industria",
      level: CourseLevel.INTERMEDIATE,
      category: CourseCategory.BRAND,
      mentorId: susy.id,
      published: true,
      featured: false,
      order: 6,
      duration: 300,
      outcomes: [
        "Definir tu propuesta de valor única",
        "Crear tu identidad visual",
        "Posicionarte como experto",
        "Networking estratégico",
        "Monetizar tu marca personal",
      ],
    },
  });

  console.log("   ✅ 6 cursos creados\n");

  // ============================================
  // MÓDULOS Y LECCIONES
  // ============================================
  console.log("📖 Creando módulos y lecciones...");

  // --- MARKETING DIGITAL: MÓDULOS ---
  const marketingMod1 = await prisma.module.upsert({
    where: { id: "mkt-mod-1" },
    update: {},
    create: {
      id: "mkt-mod-1",
      courseId: marketingCourse.id,
      title: "Fundamentos del Marketing Digital",
      description: "Los conceptos esenciales que necesitas dominar",
      order: 1,
    },
  });

  const marketingMod2 = await prisma.module.upsert({
    where: { id: "mkt-mod-2" },
    update: {},
    create: {
      id: "mkt-mod-2",
      courseId: marketingCourse.id,
      title: "Meta Ads: Facebook e Instagram",
      description: "Domina la publicidad en las redes más grandes del mundo",
      order: 2,
    },
  });

  const marketingMod3 = await prisma.module.upsert({
    where: { id: "mkt-mod-3" },
    update: {},
    create: {
      id: "mkt-mod-3",
      courseId: marketingCourse.id,
      title: "Google Ads",
      description: "Captura clientes que ya están buscando tu producto",
      order: 3,
    },
  });

  const marketingMod4 = await prisma.module.upsert({
    where: { id: "mkt-mod-4" },
    update: {},
    create: {
      id: "mkt-mod-4",
      courseId: marketingCourse.id,
      title: "Email Marketing",
      description: "Construye relaciones y convierte leads en clientes",
      order: 4,
    },
  });

  // --- MARKETING DIGITAL: LECCIONES ---
  // Módulo 1
  await prisma.lesson.upsert({ where: { id: "mkt-les-1-1" }, update: {}, create: { id: "mkt-les-1-1", moduleId: marketingMod1.id, title: "¿Qué es el Marketing Digital?", description: "Introducción completa al mundo del marketing digital", duration: 15, order: 1, videoUrl: "https://player.vimeo.com/video/example1" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-1-2" }, update: {}, create: { id: "mkt-les-1-2", moduleId: marketingMod1.id, title: "El Ecosistema Digital Actual", description: "Panorama de plataformas y oportunidades", duration: 20, order: 2, videoUrl: "https://player.vimeo.com/video/example2" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-1-3" }, update: {}, create: { id: "mkt-les-1-3", moduleId: marketingMod1.id, title: "Tu Cliente Ideal (Avatar)", description: "Cómo definir y entender a tu cliente perfecto", duration: 25, order: 3, videoUrl: "https://player.vimeo.com/video/example3" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-1-4" }, update: {}, create: { id: "mkt-les-1-4", moduleId: marketingMod1.id, title: "Estrategia vs Táctica", description: "La diferencia que separa a los amateurs de los profesionales", duration: 18, order: 4, videoUrl: "https://player.vimeo.com/video/example4" } });

  // Módulo 2
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-1" }, update: {}, create: { id: "mkt-les-2-1", moduleId: marketingMod2.id, title: "Configuración del Business Manager", description: "Setup completo de tu cuenta publicitaria", duration: 30, order: 1, videoUrl: "https://player.vimeo.com/video/example5" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-2" }, update: {}, create: { id: "mkt-les-2-2", moduleId: marketingMod2.id, title: "Estructura de Campañas", description: "Cómo organizar campañas, conjuntos y anuncios", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example6" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-3" }, update: {}, create: { id: "mkt-les-2-3", moduleId: marketingMod2.id, title: "Objetivos de Campaña", description: "Cuándo usar cada objetivo para máximo resultado", duration: 20, order: 3, videoUrl: "https://player.vimeo.com/video/example7" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-4" }, update: {}, create: { id: "mkt-les-2-4", moduleId: marketingMod2.id, title: "Segmentación Avanzada", description: "Públicos fríos, tibios y calientes", duration: 35, order: 4, videoUrl: "https://player.vimeo.com/video/example8" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-5" }, update: {}, create: { id: "mkt-les-2-5", moduleId: marketingMod2.id, title: "Creativos que Convierten", description: "Diseño de anuncios que generan clics y ventas", duration: 30, order: 5, videoUrl: "https://player.vimeo.com/video/example9" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-2-6" }, update: {}, create: { id: "mkt-les-2-6", moduleId: marketingMod2.id, title: "Optimización y Escalado", description: "Cómo mejorar resultados y escalar campañas ganadoras", duration: 25, order: 6, videoUrl: "https://player.vimeo.com/video/example10" } });

  // Módulo 3
  await prisma.lesson.upsert({ where: { id: "mkt-les-3-1" }, update: {}, create: { id: "mkt-les-3-1", moduleId: marketingMod3.id, title: "Introducción a Google Ads", description: "Cómo funciona la red de búsqueda", duration: 20, order: 1, videoUrl: "https://player.vimeo.com/video/example11" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-3-2" }, update: {}, create: { id: "mkt-les-3-2", moduleId: marketingMod3.id, title: "Investigación de Palabras Clave", description: "Encuentra las keywords más rentables", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example12" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-3-3" }, update: {}, create: { id: "mkt-les-3-3", moduleId: marketingMod3.id, title: "Creación de Campañas de Búsqueda", description: "Paso a paso para crear tu primera campaña", duration: 30, order: 3, videoUrl: "https://player.vimeo.com/video/example13" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-3-4" }, update: {}, create: { id: "mkt-les-3-4", moduleId: marketingMod3.id, title: "YouTube Ads", description: "Publicidad en video que convierte", duration: 25, order: 4, videoUrl: "https://player.vimeo.com/video/example14" } });

  // Módulo 4
  await prisma.lesson.upsert({ where: { id: "mkt-les-4-1" }, update: {}, create: { id: "mkt-les-4-1", moduleId: marketingMod4.id, title: "Fundamentos del Email Marketing", description: "Por qué el email sigue siendo rey", duration: 15, order: 1, videoUrl: "https://player.vimeo.com/video/example15" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-4-2" }, update: {}, create: { id: "mkt-les-4-2", moduleId: marketingMod4.id, title: "Construcción de Lista", description: "Lead magnets y estrategias de captación", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example16" } });
  await prisma.lesson.upsert({ where: { id: "mkt-les-4-3" }, update: {}, create: { id: "mkt-les-4-3", moduleId: marketingMod4.id, title: "Secuencias de Email", description: "Automatiza tu comunicación y ventas", duration: 30, order: 3, videoUrl: "https://player.vimeo.com/video/example17" } });

  // --- CONTENIDO VIRAL: MÓDULOS ---
  const contentMod1 = await prisma.module.upsert({
    where: { id: "cnt-mod-1" },
    update: {},
    create: {
      id: "cnt-mod-1",
      courseId: contentCourse.id,
      title: "La Ciencia de la Viralidad",
      description: "Entiende qué hace que el contenido se comparta",
      order: 1,
    },
  });

  const contentMod2 = await prisma.module.upsert({
    where: { id: "cnt-mod-2" },
    update: {},
    create: {
      id: "cnt-mod-2",
      courseId: contentCourse.id,
      title: "Reels e Historias",
      description: "Domina el formato de video corto",
      order: 2,
    },
  });

  const contentMod3 = await prisma.module.upsert({
    where: { id: "cnt-mod-3" },
    update: {},
    create: {
      id: "cnt-mod-3",
      courseId: contentCourse.id,
      title: "Storytelling para Redes",
      description: "Cuenta historias que conectan",
      order: 3,
    },
  });

  // Lecciones de Contenido Viral
  await prisma.lesson.upsert({ where: { id: "cnt-les-1-1" }, update: {}, create: { id: "cnt-les-1-1", moduleId: contentMod1.id, title: "Por qué se comparte el contenido", description: "La psicología detrás de los shares", duration: 20, order: 1, videoUrl: "https://player.vimeo.com/video/example20" } });
  await prisma.lesson.upsert({ where: { id: "cnt-les-1-2" }, update: {}, create: { id: "cnt-les-1-2", moduleId: contentMod1.id, title: "Los 6 principios de la viralidad", description: "Factores clave para contenido compartible", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example21" } });
  await prisma.lesson.upsert({ where: { id: "cnt-les-1-3" }, update: {}, create: { id: "cnt-les-1-3", moduleId: contentMod1.id, title: "Hooks que atrapan", description: "Los primeros 3 segundos cruciales", duration: 20, order: 3, videoUrl: "https://player.vimeo.com/video/example22" } });

  await prisma.lesson.upsert({ where: { id: "cnt-les-2-1" }, update: {}, create: { id: "cnt-les-2-1", moduleId: contentMod2.id, title: "Anatomía de un Reel viral", description: "Estructura y elementos clave", duration: 25, order: 1, videoUrl: "https://player.vimeo.com/video/example23" } });
  await prisma.lesson.upsert({ where: { id: "cnt-les-2-2" }, update: {}, create: { id: "cnt-les-2-2", moduleId: contentMod2.id, title: "Edición para móviles", description: "Herramientas y técnicas", duration: 30, order: 2, videoUrl: "https://player.vimeo.com/video/example24" } });
  await prisma.lesson.upsert({ where: { id: "cnt-les-2-3" }, update: {}, create: { id: "cnt-les-2-3", moduleId: contentMod2.id, title: "Tendencias y audios", description: "Cómo surfear las tendencias", duration: 20, order: 3, videoUrl: "https://player.vimeo.com/video/example25" } });

  await prisma.lesson.upsert({ where: { id: "cnt-les-3-1" }, update: {}, create: { id: "cnt-les-3-1", moduleId: contentMod3.id, title: "Estructura narrativa", description: "El viaje del héroe en 60 segundos", duration: 25, order: 1, videoUrl: "https://player.vimeo.com/video/example26" } });
  await prisma.lesson.upsert({ where: { id: "cnt-les-3-2" }, update: {}, create: { id: "cnt-les-3-2", moduleId: contentMod3.id, title: "Tu historia personal", description: "Convierte tu experiencia en contenido", duration: 20, order: 2, videoUrl: "https://player.vimeo.com/video/example27" } });

  // --- IA PARA NEGOCIOS: MÓDULOS ---
  const aiMod1 = await prisma.module.upsert({
    where: { id: "ai-mod-1" },
    update: {},
    create: {
      id: "ai-mod-1",
      courseId: aiCourse.id,
      title: "Fundamentos de IA para Emprendedores",
      description: "Entiende qué es la IA y cómo usarla",
      order: 1,
    },
  });

  const aiMod2 = await prisma.module.upsert({
    where: { id: "ai-mod-2" },
    update: {},
    create: {
      id: "ai-mod-2",
      courseId: aiCourse.id,
      title: "Domina ChatGPT y Claude",
      description: "Prompts profesionales para cualquier tarea",
      order: 2,
    },
  });

  const aiMod3 = await prisma.module.upsert({
    where: { id: "ai-mod-3" },
    update: {},
    create: {
      id: "ai-mod-3",
      courseId: aiCourse.id,
      title: "Herramientas IA para Creadores",
      description: "Generación de imágenes, videos y más",
      order: 3,
    },
  });

  await prisma.lesson.upsert({ where: { id: "ai-les-1-1" }, update: {}, create: { id: "ai-les-1-1", moduleId: aiMod1.id, title: "¿Qué es la Inteligencia Artificial?", description: "Conceptos básicos sin tecnicismos", duration: 15, order: 1, videoUrl: "https://player.vimeo.com/video/example30" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-1-2" }, update: {}, create: { id: "ai-les-1-2", moduleId: aiMod1.id, title: "IA en tu día a día", description: "Casos de uso prácticos", duration: 20, order: 2, videoUrl: "https://player.vimeo.com/video/example31" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-2-1" }, update: {}, create: { id: "ai-les-2-1", moduleId: aiMod2.id, title: "El arte del prompting", description: "Cómo comunicarte con la IA", duration: 25, order: 1, videoUrl: "https://player.vimeo.com/video/example32" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-2-2" }, update: {}, create: { id: "ai-les-2-2", moduleId: aiMod2.id, title: "Prompts para contenido", description: "Genera posts, emails y más", duration: 30, order: 2, videoUrl: "https://player.vimeo.com/video/example33" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-2-3" }, update: {}, create: { id: "ai-les-2-3", moduleId: aiMod2.id, title: "Prompts para estrategia", description: "IA como consultor de negocios", duration: 25, order: 3, videoUrl: "https://player.vimeo.com/video/example34" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-3-1" }, update: {}, create: { id: "ai-les-3-1", moduleId: aiMod3.id, title: "Generación de imágenes", description: "Midjourney, DALL-E y alternativas", duration: 25, order: 1, videoUrl: "https://player.vimeo.com/video/example35" } });
  await prisma.lesson.upsert({ where: { id: "ai-les-3-2" }, update: {}, create: { id: "ai-les-3-2", moduleId: aiMod3.id, title: "IA para videos", description: "Herramientas para crear videos con IA", duration: 20, order: 2, videoUrl: "https://player.vimeo.com/video/example36" } });

  // --- MINDSET: MÓDULOS ---
  const mindsetMod1 = await prisma.module.upsert({
    where: { id: "mnd-mod-1" },
    update: {},
    create: {
      id: "mnd-mod-1",
      courseId: mindsetCourse.id,
      title: "Fundamentos del Éxito",
      description: "La base mental de todo logro",
      order: 1,
    },
  });

  const mindsetMod2 = await prisma.module.upsert({
    where: { id: "mnd-mod-2" },
    update: {},
    create: {
      id: "mnd-mod-2",
      courseId: mindsetCourse.id,
      title: "Comunicación Poderosa",
      description: "Habla con confianza e impacto",
      order: 2,
    },
  });

  const mindsetMod3 = await prisma.module.upsert({
    where: { id: "mnd-mod-3" },
    update: {},
    create: {
      id: "mnd-mod-3",
      courseId: mindsetCourse.id,
      title: "Hábitos de Alto Rendimiento",
      description: "Rutinas que transforman resultados",
      order: 3,
    },
  });

  await prisma.lesson.upsert({ where: { id: "mnd-les-1-1" }, update: {}, create: { id: "mnd-les-1-1", moduleId: mindsetMod1.id, title: "Tu identidad determina tu destino", description: "Cómo cambiar tus creencias limitantes", duration: 25, order: 1, videoUrl: "https://player.vimeo.com/video/example40" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-1-2" }, update: {}, create: { id: "mnd-les-1-2", moduleId: mindsetMod1.id, title: "Superar el miedo al fracaso", description: "Técnicas para actuar a pesar del miedo", duration: 20, order: 2, videoUrl: "https://player.vimeo.com/video/example41" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-1-3" }, update: {}, create: { id: "mnd-les-1-3", moduleId: mindsetMod1.id, title: "Mentalidad de crecimiento", description: "De mentalidad fija a crecimiento continuo", duration: 20, order: 3, videoUrl: "https://player.vimeo.com/video/example42" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-2-1" }, update: {}, create: { id: "mnd-les-2-1", moduleId: mindsetMod2.id, title: "El poder de la voz", description: "Proyección y presencia vocal", duration: 20, order: 1, videoUrl: "https://player.vimeo.com/video/example43" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-2-2" }, update: {}, create: { id: "mnd-les-2-2", moduleId: mindsetMod2.id, title: "Lenguaje corporal de poder", description: "Comunica confianza sin palabras", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example44" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-3-1" }, update: {}, create: { id: "mnd-les-3-1", moduleId: mindsetMod3.id, title: "Rutina matutina ganadora", description: "Empieza el día con energía y enfoque", duration: 20, order: 1, videoUrl: "https://player.vimeo.com/video/example45" } });
  await prisma.lesson.upsert({ where: { id: "mnd-les-3-2" }, update: {}, create: { id: "mnd-les-3-2", moduleId: mindsetMod3.id, title: "Gestión del tiempo", description: "Productividad para emprendedores", duration: 25, order: 2, videoUrl: "https://player.vimeo.com/video/example46" } });

  console.log("   ✅ Módulos y lecciones creados\n");

  // ============================================
  // LIVES PRÓXIMOS
  // ============================================
  console.log("📺 Creando lives...");

  await prisma.liveEvent.upsert({
    where: { id: "live-mindset-1" },
    update: {},
    create: {
      id: "live-mindset-1",
      title: "Lunes Sublimes: Cómo eliminar la procrastinación",
      description: "Descubre las técnicas más efectivas para dejar de postergar y empezar a actuar. Susy te guiará en un ejercicio práctico para identificar la raíz de tu procrastinación.",
      type: LiveType.MINDSET,
      mentorId: susy.id,
      scheduledAt: getNextWeekday(1, 0),
      duration: 90,
      meetingUrl: "https://zoom.us/j/example1",
      published: true,
    },
  });

  await prisma.liveEvent.upsert({
    where: { id: "live-marketing-1" },
    update: {},
    create: {
      id: "live-marketing-1",
      title: "Miércoles Virales: Meta Ads en 2024 - Lo que funciona ahora",
      description: "Leo comparte las últimas actualizaciones de Meta Ads y las estrategias que están dando mejores resultados. Incluye sesión de Q&A.",
      type: LiveType.MARKETING,
      mentorId: leo.id,
      scheduledAt: getNextWeekday(3, 0),
      duration: 90,
      meetingUrl: "https://zoom.us/j/example2",
      published: true,
    },
  });

  await prisma.liveEvent.upsert({
    where: { id: "live-mindset-2" },
    update: {},
    create: {
      id: "live-mindset-2",
      title: "Lunes Sublimes: Comunicación asertiva",
      description: "Aprende a expresar tus ideas con claridad y confianza. Ejercicios prácticos para mejorar tu comunicación profesional y personal.",
      type: LiveType.MINDSET,
      mentorId: susy.id,
      scheduledAt: getNextWeekday(1, 1),
      duration: 90,
      meetingUrl: "https://zoom.us/j/example3",
      published: true,
    },
  });

  await prisma.liveEvent.upsert({
    where: { id: "live-marketing-2" },
    update: {},
    create: {
      id: "live-marketing-2",
      title: "Miércoles Virales: Crea tu primer funnel de ventas",
      description: "Sesión práctica donde construiremos juntos un funnel de ventas completo. Trae tu producto/servicio listo.",
      type: LiveType.MARKETING,
      mentorId: leo.id,
      scheduledAt: getNextWeekday(3, 1),
      duration: 120,
      meetingUrl: "https://zoom.us/j/example4",
      published: true,
    },
  });

  console.log("   ✅ 4 lives programados\n");

  // ============================================
  // REPLAYS
  // ============================================
  console.log("🎬 Creando replays...");

  await prisma.replay.upsert({
    where: { id: "replay-mindset-1" },
    update: {},
    create: {
      id: "replay-mindset-1",
      title: "Lunes Sublimes: Superar el síndrome del impostor",
      description: "Susy explica qué es el síndrome del impostor y comparte técnicas prácticas para superarlo y avanzar con confianza.",
      type: LiveType.MINDSET,
      mentorId: susy.id,
      videoUrl: "https://player.vimeo.com/video/replay1",
      duration: 85,
      recordedAt: getPastDate(7),
      published: true,
    },
  });

  await prisma.replay.upsert({
    where: { id: "replay-marketing-1" },
    update: {},
    create: {
      id: "replay-marketing-1",
      title: "Miércoles Virales: Estrategia de contenido para Instagram",
      description: "Leo desglosa su estrategia de contenido y muestra ejemplos reales de posts que han generado miles de interacciones.",
      type: LiveType.MARKETING,
      mentorId: leo.id,
      videoUrl: "https://player.vimeo.com/video/replay2",
      duration: 95,
      recordedAt: getPastDate(5),
      published: true,
    },
  });

  await prisma.replay.upsert({
    where: { id: "replay-mindset-2" },
    update: {},
    create: {
      id: "replay-mindset-2",
      title: "Lunes Sublimes: Manejo del estrés emprendedor",
      description: "Técnicas de respiración y mindfulness para emprendedores. Incluye meditación guiada.",
      type: LiveType.MINDSET,
      mentorId: susy.id,
      videoUrl: "https://player.vimeo.com/video/replay3",
      duration: 75,
      recordedAt: getPastDate(14),
      published: true,
    },
  });

  await prisma.replay.upsert({
    where: { id: "replay-marketing-2" },
    update: {},
    create: {
      id: "replay-marketing-2",
      title: "Miércoles Virales: Email marketing que convierte",
      description: "Cómo escribir emails que se abren, se leen y generan ventas. Incluye templates y ejemplos.",
      type: LiveType.MARKETING,
      mentorId: leo.id,
      videoUrl: "https://player.vimeo.com/video/replay4",
      duration: 100,
      recordedAt: getPastDate(12),
      published: true,
    },
  });

  await prisma.replay.upsert({
    where: { id: "replay-mindset-3" },
    update: {},
    create: {
      id: "replay-mindset-3",
      title: "Lunes Sublimes: Establecer límites saludables",
      description: "Cómo decir no sin culpa y proteger tu energía como emprendedor.",
      type: LiveType.MINDSET,
      mentorId: susy.id,
      videoUrl: "https://player.vimeo.com/video/replay5",
      duration: 80,
      recordedAt: getPastDate(21),
      published: true,
    },
  });

  await prisma.replay.upsert({
    where: { id: "replay-marketing-3" },
    update: {},
    create: {
      id: "replay-marketing-3",
      title: "Miércoles Virales: Caso de estudio - De 0 a 100k seguidores",
      description: "Leo analiza paso a paso cómo un alumno creció su cuenta de Instagram en 6 meses.",
      type: LiveType.MARKETING,
      mentorId: leo.id,
      videoUrl: "https://player.vimeo.com/video/replay6",
      duration: 110,
      recordedAt: getPastDate(19),
      published: true,
    },
  });

  console.log("   ✅ 6 replays creados\n");

  // ============================================
  // COMUNIDAD
  // ============================================
  console.log("💬 Creando categorías de comunidad...");

  const catAnuncios = await prisma.communityCategory.upsert({
    where: { slug: "anuncios" },
    update: {},
    create: { slug: "anuncios", name: "Anuncios", description: "Comunicados oficiales de Viral Academy", icon: "megaphone", order: 1 },
  });

  const catPreguntas = await prisma.communityCategory.upsert({
    where: { slug: "preguntas" },
    update: {},
    create: { slug: "preguntas", name: "Preguntas y Respuestas", description: "Resuelve tus dudas con la comunidad", icon: "help-circle", order: 2 },
  });

  const catWins = await prisma.communityCategory.upsert({
    where: { slug: "wins" },
    update: {},
    create: { slug: "wins", name: "Wins", description: "Celebra tus logros con la comunidad", icon: "trophy", order: 3 },
  });

  const catRecursos = await prisma.communityCategory.upsert({
    where: { slug: "recursos" },
    update: {},
    create: { slug: "recursos", name: "Recursos", description: "Comparte y descubre recursos útiles", icon: "folder", order: 4 },
  });

  const catGeneral = await prisma.communityCategory.upsert({
    where: { slug: "general" },
    update: {},
    create: { slug: "general", name: "General", description: "Conversación general de la comunidad", icon: "message-circle", order: 5 },
  });

  const catNetworking = await prisma.communityCategory.upsert({
    where: { slug: "networking" },
    update: {},
    create: { slug: "networking", name: "Networking", description: "Conecta con otros emprendedores", icon: "users", order: 6 },
  });

  console.log("   ✅ 6 categorías creadas\n");

  // ============================================
  // POSTS DE EJEMPLO
  // ============================================
  console.log("📝 Creando posts de ejemplo...");

  await prisma.post.upsert({
    where: { id: "post-anuncio-1" },
    update: {},
    create: {
      id: "post-anuncio-1",
      authorId: admin.id,
      categoryId: catAnuncios.id,
      title: "Bienvenidos a la nueva Viral Academy",
      content: "¡Hola familia viral! 🚀\n\nEstamos emocionados de presentar la nueva versión de Viral Academy. Ahora tendrás acceso a:\n\n- Todos los cursos en un solo lugar\n- Lives semanales con Leo y Susy\n- Comunidad exclusiva\n- Recursos descargables\n\n¡Explora y comparte tus dudas!",
      type: PostCategory.ANNOUNCEMENT,
      pinned: true,
      createdAt: getPastDate(3),
    },
  });

  await prisma.post.upsert({
    where: { id: "post-win-1" },
    update: {},
    create: {
      id: "post-win-1",
      authorId: student.id,
      categoryId: catWins.id,
      title: "Mi primer cliente de $1,000 USD gracias a lo aprendido",
      content: "Quiero compartir mi primer gran logro. Después de aplicar lo aprendido en el curso de Marketing Digital, conseguí mi primer cliente de $1,000 USD para manejar sus redes sociales.\n\nGracias Leo por las enseñanzas y a toda la comunidad por el apoyo. ¡Esto apenas comienza! 💪",
      type: PostCategory.WIN,
      createdAt: getPastDate(2),
    },
  });

  await prisma.post.upsert({
    where: { id: "post-pregunta-1" },
    update: {},
    create: {
      id: "post-pregunta-1",
      authorId: student.id,
      categoryId: catPreguntas.id,
      title: "¿Cuánto presupuesto inicial para Meta Ads?",
      content: "Hola comunidad,\n\nEstoy por lanzar mis primeras campañas de Meta Ads y tengo dudas sobre el presupuesto inicial.\n\n¿Cuánto recomiendan invertir al inicio para probar? Mi producto tiene un precio de $497 MXN.\n\nGracias por sus consejos!",
      type: PostCategory.QUESTION,
      createdAt: getPastDate(1),
    },
  });

  console.log("   ✅ Posts de ejemplo creados\n");

  // ============================================
  // RECURSOS
  // ============================================
  console.log("📁 Creando recursos...");

  await prisma.resource.upsert({
    where: { id: "res-mkt-1" },
    update: {},
    create: { id: "res-mkt-1", title: "Guía Completa de Meta Ads 2024", description: "PDF con toda la información actualizada sobre Meta Ads", fileUrl: "/resources/guia-meta-ads-2024.pdf", fileType: "pdf", fileSize: 2500000, courseId: marketingCourse.id },
  });

  await prisma.resource.upsert({
    where: { id: "res-mkt-2" },
    update: {},
    create: { id: "res-mkt-2", title: "Plantilla de Avatar de Cliente", description: "Template para definir a tu cliente ideal", fileUrl: "/resources/plantilla-avatar.pdf", fileType: "pdf", fileSize: 500000, courseId: marketingCourse.id },
  });

  await prisma.resource.upsert({
    where: { id: "res-cnt-1" },
    update: {},
    create: { id: "res-cnt-1", title: "Calendario de Contenidos 2024", description: "Plantilla de Excel para planificar tu contenido", fileUrl: "/resources/calendario-contenidos.xlsx", fileType: "xlsx", fileSize: 150000, courseId: contentCourse.id },
  });

  await prisma.resource.upsert({
    where: { id: "res-cnt-2" },
    update: {},
    create: { id: "res-cnt-2", title: "100 Hooks que Enganchan", description: "Lista de hooks probados para tus videos", fileUrl: "/resources/100-hooks.pdf", fileType: "pdf", fileSize: 800000, courseId: contentCourse.id },
  });

  await prisma.resource.upsert({
    where: { id: "res-ai-1" },
    update: {},
    create: { id: "res-ai-1", title: "Mega Pack de Prompts", description: "200+ prompts para ChatGPT y Claude", fileUrl: "/resources/mega-pack-prompts.pdf", fileType: "pdf", fileSize: 1200000, courseId: aiCourse.id },
  });

  await prisma.resource.upsert({
    where: { id: "res-mnd-1" },
    update: {},
    create: { id: "res-mnd-1", title: "Diario de Gratitud", description: "Template imprimible para tu práctica diaria", fileUrl: "/resources/diario-gratitud.pdf", fileType: "pdf", fileSize: 300000, courseId: mindsetCourse.id },
  });

  // Recursos públicos (sin courseId ni lessonId)
  await prisma.resource.upsert({
    where: { id: "res-public-1" },
    update: {},
    create: { id: "res-public-1", title: "Ebook: 7 Pasos para Emprender en Digital", description: "Guía gratuita para empezar tu negocio digital", fileUrl: "/resources/ebook-7-pasos.pdf", fileType: "pdf", fileSize: 3500000 },
  });

  await prisma.resource.upsert({
    where: { id: "res-public-2" },
    update: {},
    create: { id: "res-public-2", title: "Checklist de Lanzamiento", description: "Todo lo que necesitas antes de lanzar", fileUrl: "/resources/checklist-lanzamiento.pdf", fileType: "pdf", fileSize: 200000 },
  });

  console.log("   ✅ 8 recursos creados\n");

  // ============================================
  // ENROLLMENT Y PROGRESO
  // ============================================
  console.log("📊 Creando enrollments y progreso...");

  // Enroll student in multiple courses
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: marketingCourse.id } },
    update: {},
    create: { userId: student.id, courseId: marketingCourse.id, startedAt: getPastDate(30) },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: contentCourse.id } },
    update: {},
    create: { userId: student.id, courseId: contentCourse.id, startedAt: getPastDate(15) },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: mindsetCourse.id } },
    update: {},
    create: { userId: student.id, courseId: mindsetCourse.id, startedAt: getPastDate(10) },
  });

  // Progress for Marketing course
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-1-1" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-1-1", completed: true, completedAt: getPastDate(28), watchTime: 900 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-1-2" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-1-2", completed: true, completedAt: getPastDate(27), watchTime: 1200 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-1-3" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-1-3", completed: true, completedAt: getPastDate(25), watchTime: 1500 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-1-4" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-1-4", completed: true, completedAt: getPastDate(24), watchTime: 1100 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-2-1" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-2-1", completed: true, completedAt: getPastDate(22), watchTime: 1800 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mkt-les-2-2" } }, update: {}, create: { userId: student.id, lessonId: "mkt-les-2-2", completed: false, watchTime: 800 } });

  // Progress for Content course
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "cnt-les-1-1" } }, update: {}, create: { userId: student.id, lessonId: "cnt-les-1-1", completed: true, completedAt: getPastDate(12), watchTime: 1200 } });
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "cnt-les-1-2" } }, update: {}, create: { userId: student.id, lessonId: "cnt-les-1-2", completed: true, completedAt: getPastDate(10), watchTime: 1500 } });

  // Progress for Mindset course
  await prisma.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: "mnd-les-1-1" } }, update: {}, create: { userId: student.id, lessonId: "mnd-les-1-1", completed: true, completedAt: getPastDate(8), watchTime: 1500 } });

  console.log("   ✅ Enrollments y progreso creados\n");

  // ============================================
  // NOTIFICACIONES
  // ============================================
  console.log("🔔 Creando notificaciones...");

  await prisma.notification.createMany({
    data: [
      { userId: student.id, type: "SYSTEM", title: "Bienvenido a Viral Academy", message: "Tu cuenta ha sido activada. ¡Explora los cursos!", read: true, createdAt: getPastDate(30) },
      { userId: student.id, type: "COURSE", title: "Nuevo curso disponible", message: "El curso 'IA para Negocios' ya está disponible", read: true, link: "/app/cursos/ia-para-negocios", createdAt: getPastDate(20) },
      { userId: student.id, type: "LIVE", title: "Live mañana", message: "Recuerda: Miércoles Virales mañana a las 7pm", read: false, link: "/app/lives", createdAt: getPastDate(1) },
      { userId: student.id, type: "COMMUNITY", title: "Nueva respuesta", message: "Leo respondió a tu pregunta en la comunidad", read: false, link: "/app/comunidad", createdAt: getPastDate(0) },
    ],
    skipDuplicates: true,
  });

  console.log("   ✅ Notificaciones creadas\n");

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log("═══════════════════════════════════════════");
  console.log("🎉 SEED COMPLETADO EXITOSAMENTE");
  console.log("═══════════════════════════════════════════\n");

  console.log("📊 Resumen:");
  console.log("   • 4 usuarios (1 admin, 2 mentores, 1 estudiante)");
  console.log("   • 6 cursos con módulos y lecciones completas");
  console.log("   • 4 lives programados");
  console.log("   • 6 replays disponibles");
  console.log("   • 6 categorías de comunidad");
  console.log("   • 3 posts de ejemplo");
  console.log("   • 8 recursos descargables");
  console.log("   • Progreso de estudiante demo\n");

  console.log("🔐 Credenciales de acceso:");
  console.log("   ┌────────────────────────────────────────┐");
  console.log("   │ Admin:      admin@viralacademy.com     │");
  console.log("   │ Contraseña: admin123                   │");
  console.log("   ├────────────────────────────────────────┤");
  console.log("   │ Mentor:     leo@viralacademy.com       │");
  console.log("   │ Contraseña: mentor123                  │");
  console.log("   ├────────────────────────────────────────┤");
  console.log("   │ Estudiante: estudiante@demo.com        │");
  console.log("   │ Contraseña: student123                 │");
  console.log("   └────────────────────────────────────────┘\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
