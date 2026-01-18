import prisma from "@/lib/prisma";

export async function getUserCertificates(userId: string) {
  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          mentor: {
            include: { profile: true }
          }
        }
      }
    },
    orderBy: { issuedAt: "desc" }
  });

  return certificates;
}

export async function getCertificateByCode(verificationCode: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      user: {
        include: { profile: true }
      },
      course: {
        include: {
          mentor: {
            include: { profile: true }
          }
        }
      }
    }
  });

  return certificate;
}

export async function getCertificateById(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        include: { profile: true }
      },
      course: {
        include: {
          mentor: {
            include: { profile: true }
          }
        }
      }
    }
  });

  return certificate;
}
