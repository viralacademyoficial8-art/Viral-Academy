-- Seed Course Categories
-- Run this in Supabase SQL Editor to create initial categories

INSERT INTO "CourseCategories" (id, slug, name, description, icon, color, "order", active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'BOTS', 'Bots', 'Automatización con bots', 'bot', '#BFFF00', 0, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'LIVE_CLASSES', 'Clases En Vivo Grupales', 'Clases en vivo con mentores', 'video', '#FF6B6B', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'WEB_PAGES', 'Crear Páginas Web', 'Desarrollo web y landing pages', 'globe', '#4ECDC4', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'EBOOKS', 'Ebooks', 'Libros digitales y guías', 'book-open', '#45B7D1', 3, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'VIDEO_EDITING', 'Edición De Video', 'Edición y producción de video', 'film', '#96CEB4', 4, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'AI', 'Inteligencia Artificial', 'IA aplicada a negocios', 'sparkles', '#DDA0DD', 5, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MARKETING', 'Marketing Digital', 'Estrategias de marketing', 'megaphone', '#FFD93D', 6, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SOCIAL_VIRAL', 'Redes Sociales y Viralidad', 'Crecimiento en redes sociales', 'share-2', '#FF8C00', 7, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'CONTENT', 'Creación de Contenido', 'Creación de contenido digital', 'pen-tool', '#9B59B6', 8, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'AUTOMATION', 'Automatización', 'Herramientas de automatización', 'zap', '#3498DB', 9, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BRAND', 'Marca Personal', 'Desarrollo de marca personal', 'user', '#E74C3C', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ECOMMERCE', 'E-commerce', 'Comercio electrónico', 'shopping-cart', '#2ECC71', 11, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MINDSET', 'Mentalidad', 'Mindset y desarrollo personal', 'brain', '#F39C12', 12, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'BUSINESS', 'Negocios', 'Estrategias de negocios', 'briefcase', '#1ABC9C', 13, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  "updatedAt" = NOW();
