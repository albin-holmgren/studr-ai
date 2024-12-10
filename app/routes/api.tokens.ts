import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/lib/db.server";
import { requireUser } from "~/lib/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  // Ensure the user can only access their own token usage
  if (userId !== user.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get today's start timestamp
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get token usage for today
    const tokenUsage = await prisma.tokenUsage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        tokens: true,
      },
    });

    return json({
      tokens: tokenUsage._sum.tokens || 0,
    });
  } catch (error) {
    console.error("Failed to fetch token usage:", error);
    return json({ error: "Failed to fetch token usage" }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const tokens = Number(formData.get("tokens"));

  if (!tokens || isNaN(tokens)) {
    return json({ error: "Invalid token count" }, { status: 400 });
  }

  try {
    // Record token usage
    await prisma.tokenUsage.create({
      data: {
        userId: user.id,
        tokens,
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Failed to record token usage:", error);
    return json({ error: "Failed to record token usage" }, { status: 500 });
  }
};
