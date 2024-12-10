import { json } from "@remix-run/node";
import { requireUser } from "~/lib/session.server";
import { prisma } from "~/lib/prisma.server";
import type { ActionFunction } from "@remix-run/node";
import { uploadImage } from "~/lib/supabase.server";
import { createClient } from "@supabase/supabase-js";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (intent === "updateProfile") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
      return json({ error: "Name and email are required" }, { status: 400 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          email,
        },
      });

      return json({ user: updatedUser });
    } catch (error) {
      return json(
        { error: "Failed to update profile. Email might already be in use." },
        { status: 400 }
      );
    }
  }

  if (intent === "updateAvatar") {
    const avatarFile = formData.get("avatar") as File;
    if (!avatarFile) {
      return json({ error: "No image provided" }, { status: 400 });
    }

    try {
      const { url, error } = await uploadImage(avatarFile, user.id);
      if (error) throw error;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: url,
        },
      });

      return json({ user: updatedUser });
    } catch (error) {
      return json(
        { error: "Failed to upload avatar. Please try again." },
        { status: 500 }
      );
    }
  }

  if (intent === "changePassword") {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return json({ error: "All fields are required" }, { status: 400 });
    }

    try {
      // First verify the current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Update the password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) throw updateError;

      return json({ success: true });
    } catch (error) {
      return json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }
  }

  if (intent === "updateNotifications") {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          notificationSettings: {
            upsert: {
              create: {
                emailNotifications: formData.get("emailNotifications") === "true",
                studyReminders: formData.get("studyReminders") === "true",
                marketingEmails: formData.get("marketingEmails") === "true"
              },
              update: {
                emailNotifications: formData.get("emailNotifications") === "true",
                studyReminders: formData.get("studyReminders") === "true",
                marketingEmails: formData.get("marketingEmails") === "true"
              }
            }
          }
        }
      });

      return json({ success: true });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      return json({ error: "Failed to update notification settings" }, { status: 500 });
    }
  }

  if (intent === "downloadData") {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        documents: true,
      },
    });

    return json({ userData });
  }

  return json({ error: "Invalid request" }, { status: 400 });
};
