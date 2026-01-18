import { PublicLayout } from "@/components/layouts/public-layout";
import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { MentorsSection } from "@/components/marketing/mentors-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MentorsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </PublicLayout>
  );
}
