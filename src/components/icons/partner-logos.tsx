import Image from "next/image";
import { cn } from "@/lib/utils";

interface PartnerLogoProps {
  name: string;
  className?: string;
}

// Map partner names to their logo files
const partnerLogoFiles: Record<string, { src: string; width: number; height: number }> = {
  "Google": { src: "/images/partners/google.png", width: 100, height: 34 },
  "Google Cloud": { src: "/images/partners/google-cloud.webp", width: 140, height: 40 },
  "UTEL Universidad": { src: "/images/partners/utel.png", width: 80, height: 50 },
  "Startup México": { src: "/images/partners/startup-mexico.png", width: 150, height: 32 },
  "Tecnológico de Monterrey": { src: "/images/partners/tec-monterrey.png", width: 160, height: 40 },
  "Talent Land México": { src: "/images/partners/talent-land.webp", width: 140, height: 45 },
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
      className={cn("object-contain opacity-80 hover:opacity-100 transition-opacity", className)}
    />
  );
}

export { partnerLogoFiles };
