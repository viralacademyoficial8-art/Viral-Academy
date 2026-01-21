import { prisma } from "@/lib/prisma";
import { NewResourceClient } from "./new-resource-client";

export const dynamic = "force-dynamic";

async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
      },
    });

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export default async function NewResourcePage() {
  const courses = await getCourses();

  return <NewResourceClient courses={courses} />;
}
