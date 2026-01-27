import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "SYSTEM"
  | "COURSE"
  | "LIVE"
  | "COMMUNITY"
  | "CERTIFICATE"
  | "BILLING";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

interface CreateBulkNotificationsParams {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a single user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notifications for multiple users (bulk)
 */
export async function createBulkNotifications({
  userIds,
  type,
  title,
  message,
  link,
}: CreateBulkNotificationsParams) {
  try {
    // Filter out duplicates
    const uniqueUserIds = [...new Set(userIds)];

    return await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        link,
      })),
    });
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return null;
  }
}

/**
 * Notify all active users (for announcements)
 */
export async function notifyAllUsers(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  excludeUserId?: string
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        active: true,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    return await createBulkNotifications({
      userIds,
      type,
      title,
      message,
      link,
    });
  } catch (error) {
    console.error("Error notifying all users:", error);
    return null;
  }
}
