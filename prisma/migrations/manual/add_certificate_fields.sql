-- SQL para agregar los nuevos campos a la tabla Certificate
-- Ejecutar en Supabase SQL Editor

-- Agregar columna studentName si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Certificate' AND column_name = 'studentName') THEN
        ALTER TABLE "Certificate" ADD COLUMN "studentName" TEXT;

        -- Actualizar registros existentes con el nombre del usuario
        UPDATE "Certificate" c
        SET "studentName" = COALESCE(
            p."displayName",
            CONCAT(p."firstName", ' ', p."lastName"),
            SPLIT_PART(u.email, '@', 1)
        )
        FROM "User" u
        LEFT JOIN "Profile" p ON p."userId" = u.id
        WHERE c."userId" = u.id;

        -- Hacer la columna NOT NULL después de llenar datos
        ALTER TABLE "Certificate" ALTER COLUMN "studentName" SET NOT NULL;
    END IF;
END $$;

-- Agregar columna courseName si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Certificate' AND column_name = 'courseName') THEN
        ALTER TABLE "Certificate" ADD COLUMN "courseName" TEXT;

        -- Actualizar registros existentes con el nombre del curso
        UPDATE "Certificate" c
        SET "courseName" = co.title
        FROM "Course" co
        WHERE c."courseId" = co.id;

        -- Hacer la columna NOT NULL después de llenar datos
        ALTER TABLE "Certificate" ALTER COLUMN "courseName" SET NOT NULL;
    END IF;
END $$;

-- Agregar columna signatureUrl si no existe (puede ser NULL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Certificate' AND column_name = 'signatureUrl') THEN
        ALTER TABLE "Certificate" ADD COLUMN "signatureUrl" TEXT;
    END IF;
END $$;

-- Agregar columna completedAt si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Certificate' AND column_name = 'completedAt') THEN
        ALTER TABLE "Certificate" ADD COLUMN "completedAt" TIMESTAMP(3);

        -- Usar issuedAt como fecha de completación para registros existentes
        UPDATE "Certificate" SET "completedAt" = "issuedAt" WHERE "completedAt" IS NULL;

        -- Hacer la columna NOT NULL después de llenar datos
        ALTER TABLE "Certificate" ALTER COLUMN "completedAt" SET NOT NULL;
    END IF;
END $$;

-- Verificar que las columnas fueron creadas correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Certificate'
ORDER BY ordinal_position;
