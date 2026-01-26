import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificateView } from "./certificate-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          mentor: {
            include: {
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          email: true,
          profile: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  // Verify user owns this certificate
  if (certificate.userId !== session.user.id) {
    notFound();
  }

  const mentorName = certificate.course.mentor.profile?.displayName ||
    (certificate.course.mentor.profile?.firstName && certificate.course.mentor.profile?.lastName
      ? `${certificate.course.mentor.profile.firstName} ${certificate.course.mentor.profile.lastName}`
      : "Viral Academy");

  return (
    <CertificateView
      certificate={{
        id: certificate.id,
        verificationCode: certificate.verificationCode,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        signatureUrl: certificate.signatureUrl,
        completedAt: certificate.completedAt.toISOString(),
        issuedAt: certificate.issuedAt.toISOString(),
        mentorName,
      }}
    />
  );
}
