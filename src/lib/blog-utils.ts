// Blog utilities - can be used on both client and server

// Blog categories
export const BLOG_CATEGORIES = {
  marketing: "Marketing Digital",
  ia: "Inteligencia Artificial",
  mindset: "Mentalidad",
  negocios: "Negocios",
  contenido: "Creación de Contenido",
  general: "General",
} as const;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-|-$/g, ""); // Remove leading/trailing -
}
