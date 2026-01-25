import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/data";
import { EditProfileClient } from "./edit-profile-client";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <EditProfileClient
      initialData={{
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        displayName: user.profile?.displayName || "",
        bio: user.profile?.bio || "",
        avatar: user.profile?.avatar || "",
        email: user.email,
      }}
    />
  );
}
