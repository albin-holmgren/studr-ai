import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db.server";
import { getSupabaseUser } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getSupabaseUser(request);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      language: true,
      region: true,
    },
  });

  if (!dbUser) {
    return json({ error: "User not found" }, { status: 404 });
  }

  return json(dbUser);
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, supabase } = await getSupabaseUser(request);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  if (request.method === "PUT") {
    if (action === "updateProfile") {
      const name = formData.get("name") as string;
      const avatar = formData.get("avatar") as string;

      try {
        const updatedUser = await db.user.update({
          where: { email: user.email },
          data: {
            name: name || undefined,
            avatar: avatar || undefined,
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            language: true,
            region: true,
          },
        });

        return json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        return json({ error: "Failed to update user" }, { status: 500 });
      }
    }

    if (action === "updateEmail") {
      const newEmail = formData.get("email") as string;
      if (!newEmail) {
        return json({ error: "Email is required" }, { status: 400 });
      }

      try {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;

        await db.user.update({
          where: { email: user.email },
          data: { email: newEmail },
        });

        return json({ success: true, message: "Verification email sent" });
      } catch (error) {
        console.error("Error updating email:", error);
        return json({ error: "Failed to update email" }, { status: 500 });
      }
    }

    if (action === "updatePassword") {
      const password = formData.get("password") as string;
      if (!password) {
        return json({ error: "Password is required" }, { status: 400 });
      }

      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        return json({ success: true, message: "Password updated successfully" });
      } catch (error) {
        console.error("Error updating password:", error);
        return json({ error: "Failed to update password" }, { status: 500 });
      }
    }

    if (action === "updateLocale") {
      const language = formData.get("language") as string;
      const region = formData.get("region") as string;

      if (!language || !region) {
        return json({ error: "Language and region are required" }, { status: 400 });
      }

      try {
        const updatedUser = await db.user.update({
          where: { email: user.email },
          data: {
            language,
            region,
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            language: true,
            region: true,
          },
        });

        return json(updatedUser);
      } catch (error) {
        console.error("Error updating locale:", error);
        return json({ error: "Failed to update locale settings" }, { status: 500 });
      }
    }
  }

  if (request.method === "DELETE") {
    try {
      // Delete user data from database
      await db.user.delete({
        where: { email: user.email },
      });

      // Delete user from Supabase auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();

      return redirect("/auth/login");
    } catch (error) {
      console.error("Error deleting user:", error);
      return json({ error: "Failed to delete account" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
