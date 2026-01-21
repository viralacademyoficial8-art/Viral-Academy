import { prisma } from "@/lib/prisma";
import { NewResourceClient } from "./new-resource-client";

export const dynamic = "force-dynamic";

async function getCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
    },
  });

  return courses;
}

export default async function NewResourcePage() {
  const courses = await getCourses();

  return <NewResourceClient courses={courses} />;
}
