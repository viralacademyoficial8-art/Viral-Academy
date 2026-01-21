import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "./admin-layout-client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/auth/login");
    }

    // Check if user is admin - use select to avoid issues with new fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!user || user.role !== "ADMIN") {
      redirect("/app/dashboard");
    }

    return (
      <AdminLayoutClient
        user={{
          name: user.profile?.displayName || user.email,
          email: user.email,
          image: user.profile?.avatar,
        }}
      >
        {children}
      </AdminLayoutClient>
    );
  } catch (error) {
    console.error("Admin layout error:", error);
    redirect("/auth/login");
  }
}
