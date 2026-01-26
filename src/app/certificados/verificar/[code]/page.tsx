import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle, Calendar, User, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
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

  const mentorName = certificate.course.mentor.profile?.displayName ||
    (certificate.course.mentor.profile?.firstName && certificate.course.mentor.profile?.lastName
      ? `${certificate.course.mentor.profile.firstName} ${certificate.course.mentor.profile.lastName}`
      : "Viral Academy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-2xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold">
              Viral<span className="text-[#BFFF00]">Academy</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Verificación de Certificado</h1>
        </div>

        {/* Verification Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-6 border-b">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <Badge className="bg-green-500 text-white">Certificado Válido</Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Certificate Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-1">Otorgado a</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  {certificate.studentName}
                </p>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-1">Por completar el curso</p>
                <p className="text-lg font-semibold flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#BFFF00]" />
                  {certificate.courseName}
                </p>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-1">Instructor</p>
                <p className="font-medium">{mentorName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Fecha de completación</p>
                  <p className="font-medium flex items-center justify-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {certificate.completedAt.toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Fecha de emisión</p>
                  <p className="font-medium flex items-center justify-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {certificate.issuedAt.toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-muted-foreground text-xs mb-2">Código de verificación</p>
                <code className="bg-muted px-4 py-2 rounded-lg font-mono text-sm">
                  {certificate.verificationCode}
                </code>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                ¿Quieres obtener tu propio certificado?
              </p>
              <Button asChild className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90">
                <Link href="/">Conoce Viral Academy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          Este certificado fue emitido por Viral Academy y puede ser verificado en cualquier momento usando el código único.
        </p>
      </div>
    </div>
  );
}
