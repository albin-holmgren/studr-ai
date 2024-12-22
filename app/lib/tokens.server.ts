import { db } from "./db.server";

export async function updateTokenUsage(userId: string, tokensUsed: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      tokenUsage: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Pro users don't need token tracking
  if (user.subscriptionTier === "pro") {
    return;
  }

  // Create or update token usage
  if (!user.tokenUsage) {
    await db.tokenUsage.create({
      data: {
        userId,
        daily: tokensUsed,
      },
    });
  } else {
    // Check if we need to reset daily tokens
    const lastReset = new Date(user.tokenUsage.lastReset);
    const now = new Date();
    const newDaily = now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000 
      ? tokensUsed  // Reset to just the new tokens if it's a new day
      : user.tokenUsage.daily + tokensUsed;  // Add to existing tokens if same day

    await db.tokenUsage.update({
      where: { userId },
      data: {
        daily: newDaily,
        lastReset: now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000 ? now : undefined,
      },
    });
  }
}

export async function checkTokenAvailability(userId: string, requiredTokens: number): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      tokenUsage: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Pro users have unlimited tokens
  if (user.subscriptionTier === "pro") {
    return true;
  }

  // Check if we need to reset daily tokens
  if (user.tokenUsage) {
    const lastReset = new Date(user.tokenUsage.lastReset);
    const now = new Date();
    if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
      // If it's a new day, they have all 2000 tokens available
      return requiredTokens <= 2000;
    }
    // Check if they have enough tokens left
    return user.tokenUsage.daily + requiredTokens <= 2000;
  }

  // If no usage record exists, they have all 2000 tokens available
  return requiredTokens <= 2000;
}
