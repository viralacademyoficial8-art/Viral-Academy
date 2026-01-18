import { NavbarPublic } from "@/components/navigation/navbar-public";
import { FooterPublic } from "@/components/navigation/footer-public";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarPublic />
      <main className="flex-1">{children}</main>
      <FooterPublic />
    </div>
  );
}
