import { prisma } from "@/lib/prisma";
import { GalleryClient } from "./gallery-client";

export const dynamic = "force-dynamic";

async function getMediaStats() {
  try {
    const [total, folders, recentMedia] = await Promise.all([
      prisma.media.count(),
      prisma.media.groupBy({
        by: ["folder"],
        _count: { id: true },
        _sum: { size: true },
      }),
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          uploader: {
            select: {
              email: true,
              profile: { select: { displayName: true } },
            },
          },
        },
      }),
    ]);

    const totalSize = folders.reduce((acc, f) => acc + (f._sum.size || 0), 0);

    return {
      total,
      totalSize,
      folders: folders.map((f) => ({
        name: f.folder,
        count: f._count.id,
        size: f._sum.size || 0,
      })),
      media: recentMedia.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.log("Media table not found or error:", error);
    return {
      total: 0,
      totalSize: 0,
      folders: [],
      media: [],
    };
  }
}

export default async function GalleryPage() {
  const stats = await getMediaStats();

  return <GalleryClient initialData={stats} />;
}
