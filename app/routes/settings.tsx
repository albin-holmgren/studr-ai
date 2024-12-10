import { json, redirect, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { SettingsDialog } from "~/components/settings-dialog";
import { requireUser } from "~/lib/session.server";
import { prisma } from "~/lib/db.server";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await requireUser(request);
    
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
        notificationSettings: true,
      },
    });

    if (!userData) {
      throw new Response("User not found", { status: 404 });
    }

    // Create default notification settings if they don't exist
    if (!userData.notificationSettings) {
      const defaultSettings = await prisma.notificationSettings.create({
        data: {
          userId: userData.id,
          emailNotifications: true,
          studyReminders: true,
          marketingEmails: false,
        },
      });
      userData.notificationSettings = defaultSettings;
    }

    // Get tokens used today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tokensUsed = await prisma.tokenUsage.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
      select: {
        tokens: true,
      },
    });

    return json({
      user: userData,
      tokensUsed: tokensUsed?.tokens || 0,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 500 });
    }
    throw new Response("An unexpected error occurred", { status: 500 });
  }
};

export default function Settings() {
  const { user, tokensUsed } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen">
      <SettingsDialog
        open={true}
        onOpenChange={() => {}}
        user={user}
        subscription={user.subscription}
        tokensUsed={tokensUsed}
      />
    </div>
  );
}
