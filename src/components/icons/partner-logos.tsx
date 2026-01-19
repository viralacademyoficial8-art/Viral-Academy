import Image from "next/image";
import { cn } from "@/lib/utils";

interface PartnerLogoProps {
  name: string;
  className?: string;
}

// Map partner names to their logo files
const partnerLogoFiles: Record<string, { src: string; width: number; height: number }> = {
  "Google": { src: "/images/partners/google.svg", width: 100, height: 34 },
  "Google Cloud": { src: "/images/partners/google-cloud.svg", width: 120, height: 32 },
  "UTEL Universidad": { src: "/images/partners/utel.svg", width: 90, height: 36 },
  "Startup México": { src: "/images/partners/startup-mexico.svg", width: 130, height: 32 },
  "Tecnológico de Monterrey": { src: "/images/partners/tec-monterrey.svg", width: 140, height: 40 },
  "Talent Land México": { src: "/images/partners/talent-land.svg", width: 120, height: 32 },
};

export function PartnerLogo({ name, className }: PartnerLogoProps) {
  const logoConfig = partnerLogoFiles[name];

  if (!logoConfig) {
    return (
      <span className={cn("text-sm font-medium", className)}>
        {name}
      </span>
    );
  }

  return (
    <Image
      src={logoConfig.src}
      alt={`${name} logo`}
      width={logoConfig.width}
      height={logoConfig.height}
      className={cn("object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity", className)}
    />
  );
}

export { partnerLogoFiles };
