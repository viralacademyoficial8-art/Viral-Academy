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
      name: "Leonardo Ortiz",
      role: "Fundador / Experto en áreas digitales",
      specialties: ["Meta Ads", "Viralidad", "Funnels", "IA aplicada", "Academias", "Escalamiento"],
      bio: "Leonardo es un mentor hispano en marketing digital y viralidad. Con más de 10 años de experiencia y 100M+ vistas en YouTube, que ha guiado a miles de emprendedores a monetizar su mensaje, escalar negocios digitales y liderar con autenticidad.",
      image: "/images/mentors/leo.jpg",
      liveDay: "Miércoles",
      liveType: "MARKETING",
    },
    {
      id: "susy",
      name: "Susy Ponce",
      role: "Cofundadora / Coach transformacional",
      specialties: ["Voz", "Comunicación", "Liderazgo", "Poder Personal", "PNL", "Neurocomunicación"],
      bio: "Susy Ponce es psicopedagoga, coach transformacional con más de 22 años de experiencia, experta en ayudar a personas y líderes a sanar bloqueos, reprogramar creencias y construir una identidad auténtica que les permita brillar con propósito.",
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
