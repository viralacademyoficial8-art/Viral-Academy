import { getResources } from "@/lib/data";
import { RecursosClient } from "./recursos-client";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RecursosPage() {
  const resources = await getResources();

  const formattedResources = resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description ? stripHtml(resource.description) : null,
    fileUrl: resource.fileUrl,
    fileType: resource.fileType,
    fileSize: resource.fileSize,
    course: resource.course
      ? { title: resource.course.title, slug: resource.course.slug }
      : null,
    createdAt: resource.createdAt.toISOString(),
  }));

  return <RecursosClient resources={formattedResources} />;
}
