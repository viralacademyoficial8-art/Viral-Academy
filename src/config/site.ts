export const siteConfig = {
  name: "Viral Academy",
  description: "Academia digital de alto rendimiento enfocada en educación práctica, marketing digital, inteligencia artificial, mentalidad y negocios digitales.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://viralacademy.com",
  ogImage: "/og-image.png",
  links: {
    whatsapp: "https://wa.me/+522281387768",
    instagram: "https://instagram.com/viralacademy",
    youtube: "https://youtube.com/@viralacademy",
    tiktok: "https://tiktok.com/@viralacademy",
  },
  creator: {
    name: "Leonardo Ortiz",
    role: "Fundador / Experto en áreas digitales",
  },
  pricing: {
    monthly: {
      price: 597,
      currency: "MXN",
      interval: "mes",
    },
    yearly: {
      price: 4997,
      currency: "MXN",
      interval: "año",
      savings: "Ahorra 2 meses",
    },
  },
  stats: {
    students: "+1,500",
    reach: "+100M",
    adSpend: "+$100,000 USD",
    enterprises: "6+",
  },
  mentors: [
    {
      id: "leo",
      name: "Leonardo Gómez Ortiz",
      role: "Fundador / Experto en áreas digitales",
      specialties: ["Meta Ads", "Viralidad", "Funnels", "IA aplicada", "Academias", "Escalamiento"],
      bioShort: "Estratega digital, emprendedor y speaker en marketing, viralidad y negocios digitales.",
      bio: "Leonardo Gómez Ortiz es estratega digital, emprendedor y speaker en marketing, viralidad y negocios digitales. Ha sido speaker y capacitador en escenarios como Google Cloud, UTEL Universidad, Startup México, Talent Land y eventos de emprendimiento y bienestar como People & Wellness en el Tec de Monterrey, compartiendo estrategia real sobre contenido, ventas, automatización e inteligencia artificial aplicada a negocios. Es socio y fundador de proyectos como Viral Academy y Comprando Estamos, además de plataformas tecnológicas enfocadas en educación digital, comercio e innovación. En el escenario no motiva por motivar: enseña cómo crecer, monetizar y escalar en el mundo digital actual.",
      image: "/images/mentors/leo.jpg",
      liveDay: "Miércoles",
      liveType: "MARKETING",
    },
    {
      id: "susy",
      name: "Susy Ponce",
      role: "Cofundadora / Coach transformacional",
      specialties: ["Voz", "Comunicación", "Liderazgo", "Poder Personal", "PNL", "Neurocomunicación"],
      bioShort: "Psicopedagoga y coach transformacional con más de 22 años de experiencia acompañando a personas y líderes.",
      bio: "Psicopedagoga y coach transformacional con más de 22 años de experiencia acompañando a personas y líderes en procesos profundos de sanación emocional, reprogramación de creencias y construcción de una identidad auténtica. Especialista en PNL, comunicación consciente, liderazgo y poder personal, Susy trabaja desde la raíz: mente, voz interna e identidad. Su enfoque integra desarrollo humano, mentalidad y propósito, ayudando a las personas a liberarse de bloqueos, fortalecer su seguridad personal y liderar con coherencia y autenticidad.",
      image: "/images/mentors/susy.jpg",
      liveDay: "Lunes",
      liveType: "MINDSET",
    },
  ],
  features: [
    "Aprende marketing digital, contenido, IA y negocios desde cero",
    "Clases en vivo todas las semanas",
    "Sistemas prácticos, plantillas y recursos descargables",
    "Comunidad privada de emprendedores y creadores",
    "Mentoría directa de expertos activos en el mercado",
    "Contenido actualizado al ritmo de la tecnología",
    "Acceso mientras mantengas tu membresía activa",
  ],
  categories: [
    { id: "marketing", name: "Marketing Digital", icon: "megaphone" },
    { id: "content", name: "Creación de Contenido", icon: "video" },
    { id: "ai", name: "Inteligencia Artificial", icon: "cpu" },
    { id: "automation", name: "Automatización", icon: "settings" },
    { id: "brand", name: "Marca Personal", icon: "user" },
    { id: "ecommerce", name: "E-commerce", icon: "shopping-cart" },
    { id: "mindset", name: "Mentalidad", icon: "brain" },
    { id: "business", name: "Negocios", icon: "briefcase" },
  ],
  testimonials: [
    {
      quote: "Por fin entendí cómo estructurar mi negocio digital sin perderme.",
      author: "Alumno Viral Academy",
    },
    {
      quote: "No solo aprendí marketing, también claridad y enfoque.",
      author: "Miembro de la comunidad",
    },
    {
      quote: "Aquí no te venden humo. Te enseñan a ejecutar.",
      author: "Alumno activo",
    },
  ],
  partners: [
    "Google",
    "Google Cloud",
    "UTEL Universidad",
    "Startup México",
    "Tecnológico de Monterrey",
    "Talent Land México",
  ],
};

export type SiteConfig = typeof siteConfig;
