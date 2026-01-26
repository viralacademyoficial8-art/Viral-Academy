-- SQL para crear las tablas de comunidad
-- Ejecutar en Supabase SQL Editor

-- Crear enum PostCategory si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PostCategory') THEN
        CREATE TYPE "PostCategory" AS ENUM ('ANNOUNCEMENT', 'QUESTION', 'WIN', 'RESOURCE', 'GENERAL');
    END IF;
END $$;

-- Crear tabla CommunityCategory si no existe
CREATE TABLE IF NOT EXISTS "CommunityCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CommunityCategory_pkey" PRIMARY KEY ("id")
);

-- Crear índice único en slug
CREATE UNIQUE INDEX IF NOT EXISTS "CommunityCategory_slug_key" ON "CommunityCategory"("slug");
CREATE INDEX IF NOT EXISTS "CommunityCategory_slug_idx" ON "CommunityCategory"("slug");

-- Crear tabla Post si no existe
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PostCategory" NOT NULL DEFAULT 'GENERAL',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- Crear índices para Post
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX IF NOT EXISTS "Post_type_idx" ON "Post"("type");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");

-- Crear tabla Comment si no existe
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Crear índices para Comment
CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX IF NOT EXISTS "Comment_authorId_idx" ON "Comment"("authorId");

-- Crear tabla Like si no existe
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- Crear índices únicos para Like
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_postId_key" ON "Like"("userId", "postId");
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_commentId_key" ON "Like"("userId", "commentId");
CREATE INDEX IF NOT EXISTS "Like_postId_idx" ON "Like"("postId");
CREATE INDEX IF NOT EXISTS "Like_commentId_idx" ON "Like"("commentId");

-- Crear tabla Report si no existe
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- Crear índices para Report
CREATE INDEX IF NOT EXISTS "Report_postId_idx" ON "Report"("postId");
CREATE INDEX IF NOT EXISTS "Report_resolved_idx" ON "Report"("resolved");

-- Agregar foreign keys (con verificación)
DO $$
BEGIN
    -- Post -> User
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Post_authorId_fkey') THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Post -> CommunityCategory
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Post_categoryId_fkey') THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CommunityCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Comment -> User
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Comment_authorId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Comment -> Post
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Comment_postId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Comment -> Comment (self-reference for replies)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Comment_parentId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Like -> User
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Like_userId_fkey') THEN
        ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Like -> Post
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Like_postId_fkey') THEN
        ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Like -> Comment
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Like_commentId_fkey') THEN
        ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Report -> User
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Report_reporterId_fkey') THEN
        ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Report -> Post
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Report_postId_fkey') THEN
        ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Insertar categorías por defecto si no existen
INSERT INTO "CommunityCategory" ("id", "slug", "name", "description", "icon", "order")
VALUES
    ('cat_anuncios', 'anuncios', 'Anuncios', 'Anuncios oficiales del equipo', 'megaphone', 1),
    ('cat_preguntas', 'preguntas', 'Preguntas', 'Haz preguntas y obtén ayuda de la comunidad', 'help-circle', 2),
    ('cat_wins', 'wins', 'Wins', 'Comparte tus logros y victorias', 'trophy', 3),
    ('cat_recursos', 'recursos', 'Recursos', 'Comparte recursos útiles con la comunidad', 'folder', 4),
    ('cat_general', 'general', 'General', 'Discusiones generales', 'message-circle', 5)
ON CONFLICT ("id") DO NOTHING;

-- Verificar que las tablas fueron creadas
SELECT 'CommunityCategory' as table_name, COUNT(*) as records FROM "CommunityCategory"
UNION ALL
SELECT 'Post', COUNT(*) FROM "Post"
UNION ALL
SELECT 'Comment', COUNT(*) FROM "Comment"
UNION ALL
SELECT 'Like', COUNT(*) FROM "Like";
