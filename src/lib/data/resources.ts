import prisma from "@/lib/prisma";

export async function getResources(limit?: number) {
  const resources = await prisma.resource.findMany({
    include: {
      course: {
        select: { id: true, title: true, slug: true }
      },
      lesson: {
        select: { id: true, title: true }
      }
    },
    orderBy: { createdAt: "desc" },
    ...(limit && { take: limit })
  });

  return resources;
}

export async function getResourceById(id: string) {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      course: true,
      lesson: true
    }
  });

  return resource;
}

export async function getResourcesByCourse(courseId: string) {
  const resources = await prisma.resource.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" }
  });

  return resources;
}
