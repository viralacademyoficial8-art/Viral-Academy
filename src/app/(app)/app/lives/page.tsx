import { getAllLives, getUpcomingLives } from "@/lib/data";
import { LivesClient } from "./lives-client";

export default async function LivesPage() {
  const [upcomingLives, allLives] = await Promise.all([
    getUpcomingLives(10),
    getAllLives(),
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
    />
  );
}
