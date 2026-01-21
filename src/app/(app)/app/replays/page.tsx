import { getReplays } from "@/lib/data";
import { ReplaysClient } from "./replays-client";
import { stripHtml } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReplaysPage() {
  const replays = await getReplays();

  const formattedReplays = replays.map((replay) => ({
    id: replay.id,
    title: replay.title,
    description: replay.description ? stripHtml(replay.description) : null,
    type: replay.type,
    mentor: {
      name: replay.mentor.profile?.displayName || replay.mentor.email,
      avatar: replay.mentor.profile?.avatar,
    },
    videoUrl: replay.videoUrl,
    duration: replay.duration,
    thumbnail: replay.thumbnail,
    recordedAt: replay.recordedAt.toISOString(),
  }));

  return <ReplaysClient replays={formattedReplays} />;
}
