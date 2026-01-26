import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoriasClient } from "./categorias-client";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/app/dashboard");
  }

  const categories = await prisma.courseCat.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return <CategoriasClient initialCategories={categories} />;
}
