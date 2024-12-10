import { json } from "@remix-run/node";
import { requireUser } from "~/lib/session.server";
import { prisma } from "~/lib/prisma.server";
import type { ActionFunction } from "@remix-run/node";
import bcrypt from "bcryptjs";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updatePassword") {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return json({ error: "All password fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return json({ error: "New passwords do not match" }, { status: 400 });
    }

    try {
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
        },
      });

      return json({ success: true });
    } catch (error) {
      return json({ error: "Failed to update password" }, { status: 500 });
    }
  }

  return json({ error: "Invalid request" }, { status: 400 });
};
