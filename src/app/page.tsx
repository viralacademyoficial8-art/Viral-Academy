import { PublicLayout } from "@/components/layouts/public-layout";
import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { MentorsSection } from "@/components/marketing/mentors-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface Mentor {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  image: string | null;
  liveDay: string;
  liveType: string;
}

async function getMentors(): Promise<Mentor[]> {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });

    if (mentors.length === 0) {
      return siteConfig.mentors.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        specialties: m.specialties,
        bio: m.bio,
        image: m.image,
        liveDay: m.liveDay,
        liveType: m.liveType,
      }));
    }

    return mentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.profile?.displayName || mentor.profile?.firstName || mentor.email.split("@")[0],
      role: mentor.profile?.title || "Mentor",
      specialties: mentor.profile?.specialties || [],
      bio: mentor.profile?.bio || "",
      image: mentor.profile?.avatar || null,
      liveDay: mentor.profile?.liveDay || "",
      liveType: mentor.profile?.liveType || "MARKETING",
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return siteConfig.mentors.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      specialties: m.specialties,
      bio: m.bio,
      image: m.image,
      liveDay: m.liveDay,
      liveType: m.liveType,
    }));
  }
}

async function getStats() {
  try {
    const [userCount, courseCount, liveCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.liveEvent.count({ where: { published: true } }),
    ]);

    return {
      students: userCount > 0 ? `+${userCount.toLocaleString()}` : siteConfig.stats.students,
      courses: courseCount > 0 ? `${courseCount}+` : "45+",
      lives: liveCount > 0 ? `${liveCount}+` : "100+",
      reach: siteConfig.stats.reach,
    };
  } catch {
    return {
      students: siteConfig.stats.students,
      courses: "45+",
      lives: "100+",
      reach: siteConfig.stats.reach,
    };
  }
}

export default async function HomePage() {
  const [mentors, stats] = await Promise.all([
    getMentors(),
    getStats(),
  ]);

  return (
    <PublicLayout>
      <HeroSection />
      <StatsSection stats={stats} />
      <FeaturesSection />
      <MentorsSection mentors={mentors} />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </PublicLayout>
  );
}
