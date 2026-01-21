import { getAllLives, getUpcomingLives } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { LivesClient } from "./lives-client";

export const dynamic = "force-dynamic";

interface Schedule {
  id: string;
  name: string;
  day: string;
  type: string;
  topic: string;
}

async function getSchedule(): Promise<Schedule[]> {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
        profile: {
          liveDay: { not: null },
        },
      },
      include: { profile: true },
    });

    if (mentors.length === 0) {
      // Fallback to siteConfig
      return siteConfig.mentors.map((m) => ({
        id: m.id,
        name: m.name.split(" ")[0],
        day: m.liveDay,
        type: m.liveType,
        topic: m.liveType === "MINDSET" ? "Mentalidad" : "Marketing & IA",
      }));
    }

    return mentors
      .filter(m => m.profile?.liveDay)
      .map((mentor) => ({
        id: mentor.id,
        name: mentor.profile?.displayName?.split(" ")[0] || mentor.email.split("@")[0],
        day: mentor.profile?.liveDay || "",
        type: mentor.profile?.liveType || "MARKETING",
        topic: mentor.profile?.liveType === "MINDSET" ? "Mentalidad" : "Marketing & IA",
      }));
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return siteConfig.mentors.map((m) => ({
      id: m.id,
      name: m.name.split(" ")[0],
      day: m.liveDay,
      type: m.liveType,
      topic: m.liveType === "MINDSET" ? "Mentalidad" : "Marketing & IA",
    }));
  }
}

export default async function LivesPage() {
  const [upcomingLives, allLives, schedule] = await Promise.all([
    getUpcomingLives(10),
    getAllLives(),
    getSchedule(),
  ]);

  const formatLive = (live: typeof allLives[0]) => ({
    id: live.id,
    title: live.title,
    description: live.description,
    type: live.type,
    mentor: {
      name: live.mentor.profile?.displayName || live.mentor.email,
      avatar: live.mentor.profile?.avatar,
    },
    scheduledAt: live.scheduledAt.toISOString(),
    duration: live.duration,
    meetingUrl: live.meetingUrl,
    thumbnail: live.thumbnail,
  });

  return (
    <LivesClient
      upcomingLives={upcomingLives.map(formatLive)}
      pastLives={allLives.filter(l => l.scheduledAt < new Date()).map(formatLive)}
      schedule={schedule}
    />
  );
}
