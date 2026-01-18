import prisma from "@/lib/prisma";

export async function getUpcomingLives(limit = 5) {
  const lives = await prisma.liveEvent.findMany({
    where: {
      published: true,
      scheduledAt: { gte: new Date() }
    },
    include: {
      mentor: {
        include: { profile: true }
      }
    },
    orderBy: { scheduledAt: "asc" },
    take: limit
  });

  return lives;
}

export async function getAllLives() {
  const lives = await prisma.liveEvent.findMany({
    where: { published: true },
    include: {
      mentor: {
        include: { profile: true }
      }
    },
    orderBy: { scheduledAt: "desc" }
  });

  return lives;
}

export async function getLiveById(id: string) {
  const live = await prisma.liveEvent.findUnique({
    where: { id },
    include: {
      mentor: {
        include: { profile: true }
      },
      replays: true
    }
  });

  return live;
}

export async function getReplays(limit?: number) {
  const replays = await prisma.replay.findMany({
    where: { published: true },
    include: {
      mentor: {
        include: { profile: true }
      },
      liveEvent: true
    },
    orderBy: { recordedAt: "desc" },
    ...(limit && { take: limit })
  });

  return replays;
}

export async function getReplayById(id: string) {
  const replay = await prisma.replay.findUnique({
    where: { id },
    include: {
      mentor: {
        include: { profile: true }
      },
      liveEvent: true
    }
  });

  return replay;
}

export async function getLivesThisWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const count = await prisma.liveEvent.count({
    where: {
      published: true,
      scheduledAt: {
        gte: startOfWeek,
        lt: endOfWeek
      }
    }
  });

  return count;
}
