export const siteConfig = {
  name: "Viral Academy",
  description: "Academia digital de alto rendimiento enfocada en educación práctica, marketing digital, inteligencia artificial, mentalidad y negocios digitales.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://viralacademy.com",
  ogImage: "/og-image.png",
  links: {
    whatsapp: "https://wa.me/+521XXXXXXXXXX",
    instagram: "https://instagram.com/viralacademy",
    youtube: "https://youtube.com/@viralacademy",
    tiktok: "https://tiktok.com/@viralacademy",
  },
  creator: {
    name: "Leonardo Gómez Ortiz",
    role: "Founder & Lead Mentor",
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
  },
  mentors: [
    {
      id: "leo",
      name: "Leonardo Gómez Ortiz",
      role: "Founder & Lead Mentor",
      specialties: ["Meta Ads", "Viralidad", "Funnels", "IA aplicada", "Academias", "Escalamiento"],
      bio: "Estratega digital y mentor de viralidad, marketing e inteligencia artificial aplicada a negocios. Ha alcanzado a más de 100 millones de personas con campañas y contenidos, gestionado más de 100,000 USD en pauta y formado a miles de alumnos en marketing, contenido y sistemas digitales escalables.",
      image: "/images/mentors/leo.jpg",
      liveDay: "Miércoles",
      liveType: "MARKETING",
    },
    {
      id: "susy",
      name: "Susy Ponce",
      role: "Co-Mentora · Voz, Mentalidad y Poder Personal",
      specialties: ["Voz", "Comunicación", "Liderazgo", "Poder Personal", "PNL", "Neurocomunicación"],
      bio: "Master Speaker internacional y mentora en comunicación consciente, liderazgo y mentalidad. Especialista en PNL, neurocomunicación y desarrollo del poder personal para emprendedores y creadores.",
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
