"use client";

import { forwardRef } from "react";

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  completedAt: Date;
  verificationCode: string;
  signatureUrl?: string | null;
  mentorName?: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, completedAt, verificationCode, signatureUrl, mentorName }, ref) => {
    const formattedDate = new Date(completedAt).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="w-[1056px] h-[816px] bg-white relative overflow-hidden"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-8 border-t-8 border-[#BFFF00] m-4" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r-8 border-t-8 border-[#BFFF00] m-4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-8 border-b-8 border-[#BFFF00] m-4" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-8 border-b-8 border-[#BFFF00] m-4" />

          {/* Inner border */}
          <div className="absolute inset-8 border-2 border-neutral-200" />
          <div className="absolute inset-10 border border-neutral-100" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 py-16 text-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#BFFF00] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <polygon points="8,5 19,12 8,19" fill="black" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-neutral-800">Viral Academy</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-neutral-800 mb-2 tracking-wide">
            CERTIFICADO
          </h1>
          <p className="text-xl text-neutral-500 mb-8 tracking-widest uppercase">
            de finalización
          </p>

          {/* Decorative line */}
          <div className="w-48 h-1 bg-[#BFFF00] mb-8" />

          {/* Certificate text */}
          <p className="text-lg text-neutral-600 mb-4">
            Se certifica que
          </p>

          {/* Student Name */}
          <h2 className="text-4xl font-bold text-neutral-800 mb-4 border-b-2 border-[#BFFF00] pb-2 px-8">
            {studentName}
          </h2>

          {/* Course completion text */}
          <p className="text-lg text-neutral-600 mb-2 max-w-2xl">
            ha completado satisfactoriamente el curso
          </p>

          {/* Course Name */}
          <h3 className="text-2xl font-semibold text-neutral-700 mb-8 max-w-2xl">
            &ldquo;{courseName}&rdquo;
          </h3>

          {/* Date */}
          <p className="text-neutral-500 mb-12">
            Otorgado el {formattedDate}
          </p>

          {/* Signatures section */}
          <div className="flex justify-center gap-24 mt-auto">
            {/* Student signature */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-16 border-b border-neutral-300 flex items-end justify-center pb-1 mb-2">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Firma del estudiante"
                    className="max-h-14 max-w-44 object-contain"
                  />
                ) : (
                  <span className="text-neutral-300 text-sm italic">Sin firma</span>
                )}
              </div>
              <p className="text-sm text-neutral-500">{studentName}</p>
              <p className="text-xs text-neutral-400">Estudiante</p>
            </div>

            {/* Viral Academy signature */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-16 border-b border-neutral-300 flex items-end justify-center pb-1 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#BFFF00] rounded flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <polygon points="8,5 19,12 8,19" fill="black" />
                    </svg>
                  </div>
                  <span className="font-bold text-neutral-700">Viral Academy</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500">{mentorName || "Viral Academy"}</p>
              <p className="text-xs text-neutral-400">Instructor</p>
            </div>
          </div>

          {/* Verification code */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-neutral-400">
            <span>Código de verificación:</span>
            <code className="bg-neutral-100 px-2 py-1 rounded font-mono">{verificationCode}</code>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";
