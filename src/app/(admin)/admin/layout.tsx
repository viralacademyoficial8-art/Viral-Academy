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
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
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
}
